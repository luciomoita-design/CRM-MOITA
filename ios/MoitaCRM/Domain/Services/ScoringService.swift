import Foundation
import Combine

// MARK: - Lead Scoring

protocol ScoringService {
    func score(lead: Lead) -> AnyPublisher<Int, Never>
    func rescore(lead: Lead) -> AnyPublisher<Lead, Error>
}

final class DefaultScoringService: ScoringService {
    private let rulesRepository: ScoringRuleRepository
    private let leadRepository: LeadRepository
    private let auditLogRepository: AuditLogRepository

    init(rulesRepository: ScoringRuleRepository,
         leadRepository: LeadRepository,
         auditLogRepository: AuditLogRepository) {
        self.rulesRepository = rulesRepository
        self.leadRepository = leadRepository
        self.auditLogRepository = auditLogRepository
    }

    func score(lead: Lead) -> AnyPublisher<Int, Never> {
        rulesRepository.rules()
            .replaceError(with: [])
            .map { rules in
                rules.reduce(0) { partial, rule in
                    partial + self.score(for: lead, rule: rule)
                }
            }
            .map { max(0, min(100, $0)) }
            .eraseToAnyPublisher()
    }

    func rescore(lead: Lead) -> AnyPublisher<Lead, Error> {
        score(lead: lead)
            .setFailureType(to: Error.self)
            .flatMap { score -> AnyPublisher<Void, Error> in
                lead.score = score
                lead.updatedAt = .now
                let diff = ["score": score]
                let log = AuditLog(actorId: lead.ownerId,
                                   action: "score_updated",
                                   entityType: "lead",
                                   entityId: lead.id,
                                   diffJSON: Self.jsonString(diff))
                return Publishers.Zip(
                    self.leadRepository.save(lead: lead),
                    self.auditLogRepository.record(log)
                )
                .map { _ in }
                .eraseToAnyPublisher()
            }
            .map { lead }
            .eraseToAnyPublisher()
    }

    private func score(for lead: Lead, rule: ScoringRule) -> Int {
        guard let data = rule.conditionJSON.data(using: .utf8),
              let condition = try? JSONDecoder().decode(ScoringCondition.self, from: data) else {
            return 0
        }
        return condition.evaluate(lead: lead) ? rule.weight : 0
    }

    private static func jsonString(_ value: Any) -> String {
        guard let data = try? JSONSerialization.data(withJSONObject: value, options: [.sortedKeys]) else {
            return "{}"
        }
        return String(data: data, encoding: .utf8) ?? "{}"
    }
}

struct ScoringCondition: Codable {
    enum Operation: String, Codable {
        case equals = "eq"
        case `in`
        case greaterThan = "gt"
        case lessThan = "lt"
    }

    var field: String
    var op: Operation
    var value: CodableValue

    func evaluate(lead: Lead) -> Bool {
        switch field {
        case "source":
            return evaluateString(lead.source)
        case "status":
            return evaluateString(lead.status)
        case "score":
            return evaluateNumber(Double(lead.score))
        case "consentToContact":
            return evaluateBool(lead.consentToContact)
        default:
            return false
        }
    }

    private func evaluateString(_ candidate: String) -> Bool {
        switch op {
        case .equals:
            return candidate.caseInsensitiveCompare(value.stringValue ?? "") == .orderedSame
        case .in:
            return value.arrayValue?.contains(where: { $0.caseInsensitiveCompare(candidate) == .orderedSame }) ?? false
        default:
            return false
        }
    }

    private func evaluateNumber(_ candidate: Double) -> Bool {
        switch op {
        case .greaterThan:
            return candidate > (value.doubleValue ?? 0)
        case .lessThan:
            return candidate < (value.doubleValue ?? 0)
        default:
            return false
        }
    }

    private func evaluateBool(_ candidate: Bool) -> Bool {
        guard op == .equals else { return false }
        return candidate == (value.boolValue ?? false)
    }
}

struct CodableValue: Codable {
    var rawValue: AnyCodable

    init(from decoder: Decoder) throws {
        rawValue = try AnyCodable(from: decoder)
    }

    func encode(to encoder: Encoder) throws {
        try rawValue.encode(to: encoder)
    }

    var stringValue: String? { rawValue.value as? String }
    var arrayValue: [String]? { rawValue.value as? [String] }
    var doubleValue: Double? {
        if let value = rawValue.value as? Double { return value }
        if let value = rawValue.value as? Int { return Double(value) }
        return nil
    }
    var boolValue: Bool? { rawValue.value as? Bool }
}

struct AnyCodable: Codable {
    let value: Any

    init(_ value: Any) {
        self.value = value
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let string = try? container.decode(String.self) {
            value = string
        } else if let int = try? container.decode(Int.self) {
            value = int
        } else if let double = try? container.decode(Double.self) {
            value = double
        } else if let bool = try? container.decode(Bool.self) {
            value = bool
        } else if let array = try? container.decode([String].self) {
            value = array
        } else {
            value = ""
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch value {
        case let string as String: try container.encode(string)
        case let int as Int: try container.encode(int)
        case let double as Double: try container.encode(double)
        case let bool as Bool: try container.encode(bool)
        case let array as [String]: try container.encode(array)
        default: try container.encodeNil()
        }
    }
}
