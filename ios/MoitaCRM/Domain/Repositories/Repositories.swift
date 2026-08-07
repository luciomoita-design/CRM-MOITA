import Foundation
import Combine

// MARK: - Repository Protocols used for dependency inversion

protocol UserRepository {
    func currentUser() -> AnyPublisher<User?, Never>
    func save(user: User) -> AnyPublisher<Void, Error>
}

protocol PipelineRepository {
    func pipelines() -> AnyPublisher<[Pipeline], Error>
    func save(pipeline: Pipeline) -> AnyPublisher<Void, Error>
    func delete(pipeline: Pipeline) -> AnyPublisher<Void, Error>
}

protocol StageRepository {
    func stages(for pipelineId: UUID) -> AnyPublisher<[Stage], Error>
}

protocol LeadRepository {
    func leads(query: LeadQuery) -> AnyPublisher<[Lead], Error>
    func lead(id: UUID) -> AnyPublisher<Lead?, Error>
    func save(lead: Lead) -> AnyPublisher<Void, Error>
    func delete(lead: Lead) -> AnyPublisher<Void, Error>
}

struct LeadQuery {
    var search: String?
    var ownerId: UUID?
    var source: String?
    var consentOnly: Bool = false
}

protocol DealRepository {
    func deals(for pipelineId: UUID) -> AnyPublisher<[Deal], Error>
    func save(deal: Deal) -> AnyPublisher<Void, Error>
}

protocol ActivityRepository {
    func upcomingActivities() -> AnyPublisher<[Activity], Error>
    func save(activity: Activity) -> AnyPublisher<Void, Error>
}

protocol CalendarRepository {
    func events(range: DateInterval) -> AnyPublisher<[CalendarEvent], Error>
    func save(event: CalendarEvent) -> AnyPublisher<Void, Error>
}

protocol CustomFieldRepository {
    func definitions(scope: CustomFieldScope) -> AnyPublisher<[CustomFieldDefinition], Error>
    func save(definition: CustomFieldDefinition) -> AnyPublisher<Void, Error>
}

protocol ScoringRuleRepository {
    func rules() -> AnyPublisher<[ScoringRule], Error>
}

protocol SLARepository {
    func configurations() -> AnyPublisher<[SLAConfig], Error>
}

protocol AuditLogRepository {
    func record(_ log: AuditLog) -> AnyPublisher<Void, Error>
}

protocol SyncQueueRepository {
    func enqueue(_ job: SyncJob)
    func pendingJobs() -> [SyncJob]
    func remove(_ job: SyncJob)
}

protocol NotificationScheduling {
    func schedule(for activity: Activity)
    func cancel(for activityId: UUID)
}

protocol KeychainStorage {
    func store(token: String, for key: String) throws
    func token(for key: String) throws -> String?
    func removeToken(for key: String) throws
}
