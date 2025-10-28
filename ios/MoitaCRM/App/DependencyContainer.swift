import Foundation
import Combine
import SwiftData

final class DependencyContainer: ObservableObject {
    static let shared = DependencyContainer()

    private let context: ModelContext
    private let persistence: PersistenceController

    let leadRepository: LeadRepository
    let dealRepository: DealRepository
    let activityRepository: ActivityRepository
    let scoringService: ScoringService
    let slaService: SLAService
    let syncService: SyncService
    let remoteToggle: RemoteToggle

    private init() {
        persistence = PersistenceController.shared
        context = ModelContext(persistence.container)

        let leadRepo = SwiftDataLeadRepository(context: context)
        let dealRepo = SwiftDataDealRepository(context: context)
        let activityRepo = SwiftDataActivityRepository(context: context)
        let queueRepo = InMemorySyncQueueRepository()
        let auditRepo = LocalAuditLogRepository(context: context)
        let scoringRulesRepo = SwiftDataScoringRuleRepository(context: context)
        let slaRepo = SwiftDataSLARepository(context: context)
        let apiClient = RESTAPIClient(configuration: .init(baseURL: URL(string: "https://mock.moita.crm/api")!, session: .shared))
        let scoring = DefaultScoringService(rulesRepository: scoringRulesRepo,
                                            leadRepository: leadRepo,
                                            auditLogRepository: auditRepo)
        let slaService = DefaultSLAService(repository: slaRepo,
                                           activityRepository: activityRepo,
                                           notificationScheduler: LocalNotificationScheduler())
        let syncService = DefaultSyncService(queueRepository: queueRepo, apiClient: apiClient)

        leadRepository = leadRepo
        dealRepository = dealRepo
        activityRepository = activityRepo
        scoringService = scoring
        self.slaService = slaService
        self.syncService = syncService
        self.remoteToggle = RemoteToggle()
    }
}
