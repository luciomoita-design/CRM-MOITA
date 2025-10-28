import XCTest
import Combine
@testable import MoitaCRM

final class ScoringServiceTests: XCTestCase {
    func testScoreAppliesWeights() throws {
        let lead = Lead(orgId: UUID(),
                        name: "Teste",
                        company: "Empresa",
                        email: "teste@empresa.com",
                        phone: "",
                        source: "Referral",
                        ownerId: UUID(),
                        score: 0,
                        status: "Novo",
                        consentToContact: true)

        let ruleRepository = MockRuleRepository()
        let leadRepository = MockLeadRepository()
        let auditRepository = MockAuditRepository()
        let service = DefaultScoringService(rulesRepository: ruleRepository,
                                            leadRepository: leadRepository,
                                            auditLogRepository: auditRepository)

        let expectation = expectation(description: "score")
        _ = service.rescore(lead: lead)
            .sink(receiveCompletion: { completion in
                if case let .failure(error) = completion {
                    XCTFail("Unexpected error \(error)")
                }
            }, receiveValue: { updated in
                XCTAssertEqual(updated.score, 35)
                expectation.fulfill()
            })
        wait(for: [expectation], timeout: 2)
    }
}

private final class MockRuleRepository: ScoringRuleRepository {
    func rules() -> AnyPublisher<[ScoringRule], Error> {
        let rules = [
            ScoringRule(name: "Origem", weight: 20, conditionJSON: "{\"field\":\"source\",\"op\":\"eq\",\"value\":\"Referral\"}"),
            ScoringRule(name: "Consentimento", weight: 15, conditionJSON: "{\"field\":\"consentToContact\",\"op\":\"eq\",\"value\":true}")
        ]
        return Just(rules).setFailureType(to: Error.self).eraseToAnyPublisher()
    }
}

private final class MockLeadRepository: LeadRepository {
    func leads(query: LeadQuery) -> AnyPublisher<[Lead], Error> { Just([]).setFailureType(to: Error.self).eraseToAnyPublisher() }
    func lead(id: UUID) -> AnyPublisher<Lead?, Error> { Just(nil).setFailureType(to: Error.self).eraseToAnyPublisher() }
    func save(lead: Lead) -> AnyPublisher<Void, Error> { Just(()).setFailureType(to: Error.self).eraseToAnyPublisher() }
    func delete(lead: Lead) -> AnyPublisher<Void, Error> { Just(()).setFailureType(to: Error.self).eraseToAnyPublisher() }
}

private final class MockAuditRepository: AuditLogRepository {
    func record(_ log: AuditLog) -> AnyPublisher<Void, Error> {
        Just(()).setFailureType(to: Error.self).eraseToAnyPublisher()
    }
}
