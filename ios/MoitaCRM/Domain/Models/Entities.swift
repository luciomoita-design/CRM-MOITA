import Foundation
import SwiftData

// MARK: - Core Domain Entities backed by SwiftData

@Model
final class User: Identifiable {
    @Attribute(.unique) var id: UUID
    var name: String
    var email: String
    var role: UserRole
    var timezone: String

    init(id: UUID = UUID(), name: String, email: String, role: UserRole, timezone: String) {
        self.id = id
        self.name = name
        self.email = email
        self.role = role
        self.timezone = timezone
    }
}

enum UserRole: String, Codable, CaseIterable {
    case admin
    case manager
    case rep
}

@Model
final class Pipeline: Identifiable {
    @Attribute(.unique) var id: UUID
    var name: String
    var order: Int
    @Relationship(deleteRule: .cascade, inverse: \Stage.pipeline) var stages: [Stage]

    init(id: UUID = UUID(), name: String, order: Int, stages: [Stage] = []) {
        self.id = id
        self.name = name
        self.order = order
        self.stages = stages
    }
}

@Model
final class Stage: Identifiable {
    @Attribute(.unique) var id: UUID
    @Relationship var pipeline: Pipeline?
    var name: String
    var order: Int
    var probability: Double

    init(id: UUID = UUID(), pipeline: Pipeline? = nil, name: String, order: Int, probability: Double) {
        self.id = id
        self.pipeline = pipeline
        self.name = name
        self.order = order
        self.probability = probability
    }
}

@Model
final class Lead: Identifiable {
    @Attribute(.unique) var id: UUID
    var orgId: UUID
    var name: String
    var company: String
    var email: String
    var phone: String
    var source: String
    var ownerId: UUID
    var score: Int
    var status: String
    var consentToContact: Bool
    var createdAt: Date
    var updatedAt: Date
    @Relationship(deleteRule: .cascade) var deals: [Deal]
    @Relationship(deleteRule: .cascade) var activities: [Activity]

    init(id: UUID = UUID(),
         orgId: UUID,
         name: String,
         company: String,
         email: String,
         phone: String,
         source: String,
         ownerId: UUID,
         score: Int,
         status: String,
         consentToContact: Bool,
         createdAt: Date = .now,
         updatedAt: Date = .now) {
        self.id = id
        self.orgId = orgId
        self.name = name
        self.company = company
        self.email = email
        self.phone = phone
        self.source = source
        self.ownerId = ownerId
        self.score = score
        self.status = status
        self.consentToContact = consentToContact
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.deals = []
        self.activities = []
    }
}

extension Lead: Hashable {
    static func == (lhs: Lead, rhs: Lead) -> Bool {
        lhs.id == rhs.id
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}

@Model
final class Deal: Identifiable {
    @Attribute(.unique) var id: UUID
    @Relationship var lead: Lead?
    var pipelineId: UUID
    var stageId: UUID
    var amountBRL: Decimal
    var currency: String
    var probability: Double
    var expectedCloseAt: Date?
    var ownerId: UUID

    init(id: UUID = UUID(), lead: Lead? = nil, pipelineId: UUID, stageId: UUID, amountBRL: Decimal, currency: String, probability: Double, expectedCloseAt: Date?, ownerId: UUID) {
        self.id = id
        self.lead = lead
        self.pipelineId = pipelineId
        self.stageId = stageId
        self.amountBRL = amountBRL
        self.currency = currency
        self.probability = probability
        self.expectedCloseAt = expectedCloseAt
        self.ownerId = ownerId
    }
}

enum ActivityType: String, Codable, CaseIterable, Identifiable {
    case call
    case meet
    case email
    case whatsapp
    case task

    var id: String { rawValue }

    var localizedName: String {
        switch self {
        case .call: return "Chamada"
        case .meet: return "Reunião"
        case .email: return "E-mail"
        case .whatsapp: return "WhatsApp"
        case .task: return "Tarefa"
        }
    }
}

@Model
final class Activity: Identifiable {
    @Attribute(.unique) var id: UUID
    @Relationship var lead: Lead?
    @Relationship var deal: Deal?
    var type: ActivityType
    var title: String
    var notes: String
    var dueAt: Date
    var doneAt: Date?
    var ownerId: UUID
    var createdAt: Date

    init(id: UUID = UUID(), lead: Lead? = nil, deal: Deal? = nil, type: ActivityType, title: String, notes: String, dueAt: Date, doneAt: Date? = nil, ownerId: UUID, createdAt: Date = .now) {
        self.id = id
        self.lead = lead
        self.deal = deal
        self.type = type
        self.title = title
        self.notes = notes
        self.dueAt = dueAt
        self.doneAt = doneAt
        self.ownerId = ownerId
        self.createdAt = createdAt
    }
}

@Model
final class CalendarEvent: Identifiable {
    @Attribute(.unique) var id: UUID
    var title: String
    var notes: String
    var startAt: Date
    var endAt: Date
    var allDay: Bool
    var ownerId: UUID
    var relatedLeadId: UUID?
    var relatedDealId: UUID?

    init(id: UUID = UUID(), title: String, notes: String, startAt: Date, endAt: Date, allDay: Bool, ownerId: UUID, relatedLeadId: UUID? = nil, relatedDealId: UUID? = nil) {
        self.id = id
        self.title = title
        self.notes = notes
        self.startAt = startAt
        self.endAt = endAt
        self.allDay = allDay
        self.ownerId = ownerId
        self.relatedLeadId = relatedLeadId
        self.relatedDealId = relatedDealId
    }
}

enum CustomFieldKind: String, Codable, CaseIterable {
    case text
    case number
    case date
    case select
    case multiselect
    case bool
}

@Model
final class CustomFieldDefinition: Identifiable {
    @Attribute(.unique) var id: UUID
    var scope: CustomFieldScope
    var key: String
    var label: String
    var kind: CustomFieldKind
    var options: [String]
    var required: Bool

    init(id: UUID = UUID(), scope: CustomFieldScope, key: String, label: String, kind: CustomFieldKind, options: [String] = [], required: Bool) {
        self.id = id
        self.scope = scope
        self.key = key
        self.label = label
        self.kind = kind
        self.options = options
        self.required = required
    }
}

enum CustomFieldScope: String, Codable, CaseIterable {
    case lead
    case deal
}

@Model
final class CustomFieldValue: Identifiable {
    @Attribute(.unique) var id: UUID
    var definitionId: UUID
    var entityId: UUID
    var valueJSON: String

    init(id: UUID = UUID(), definitionId: UUID, entityId: UUID, valueJSON: String) {
        self.id = id
        self.definitionId = definitionId
        self.entityId = entityId
        self.valueJSON = valueJSON
    }
}

@Model
final class ScoringRule: Identifiable {
    @Attribute(.unique) var id: UUID
    var name: String
    var weight: Int
    var conditionJSON: String

    init(id: UUID = UUID(), name: String, weight: Int, conditionJSON: String) {
        self.id = id
        self.name = name
        self.weight = weight
        self.conditionJSON = conditionJSON
    }
}

@Model
final class SLAConfig: Identifiable {
    @Attribute(.unique) var id: UUID
    var name: String
    var target: SLATarget
    var minutes: Int
    var active: Bool

    init(id: UUID = UUID(), name: String, target: SLATarget, minutes: Int, active: Bool) {
        self.id = id
        self.name = name
        self.target = target
        self.minutes = minutes
        self.active = active
    }
}

enum SLATarget: String, Codable, CaseIterable {
    case first_contact
    case stage_move
}

@Model
final class AuditLog: Identifiable {
    @Attribute(.unique) var id: UUID
    var actorId: UUID
    var action: String
    var entityType: String
    var entityId: UUID
    var diffJSON: String
    var createdAt: Date

    init(id: UUID = UUID(), actorId: UUID, action: String, entityType: String, entityId: UUID, diffJSON: String, createdAt: Date = .now) {
        self.id = id
        self.actorId = actorId
        self.action = action
        self.entityType = entityType
        self.entityId = entityId
        self.diffJSON = diffJSON
        self.createdAt = createdAt
    }
}
