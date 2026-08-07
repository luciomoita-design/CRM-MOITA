import Foundation
import Combine

protocol SLAService {
    func evaluate(for lead: Lead) -> AnyPublisher<[SLAAlert], Never>
    func evaluate(for deal: Deal) -> AnyPublisher<[SLAAlert], Never>
}

struct SLAAlert: Identifiable, Equatable {
    enum Entity {
        case lead(UUID)
        case deal(UUID)
    }

    let id = UUID()
    let entity: Entity
    let config: SLAConfig
    let violated: Bool
    let dueDate: Date
}

final class DefaultSLAService: SLAService {
    private let repository: SLARepository
    private let activityRepository: ActivityRepository
    private let notificationScheduler: NotificationScheduling

    init(repository: SLARepository,
         activityRepository: ActivityRepository,
         notificationScheduler: NotificationScheduling) {
        self.repository = repository
        self.activityRepository = activityRepository
        self.notificationScheduler = notificationScheduler
    }

    func evaluate(for lead: Lead) -> AnyPublisher<[SLAAlert], Never> {
        repository.configurations()
            .replaceError(with: [])
            .map { configs -> [SLAAlert] in
                configs.filter { $0.active }
                    .compactMap { config -> SLAAlert? in
                        switch config.target {
                        case .first_contact:
                            guard let firstActivity = lead.activities.sorted(by: { $0.createdAt < $1.createdAt }).first else {
                                let dueDate = lead.createdAt.addingTimeInterval(Double(config.minutes) * 60)
                                let violated = Date.now > dueDate
                                return SLAAlert(entity: .lead(lead.id), config: config, violated: violated, dueDate: dueDate)
                            }
                            let dueDate = lead.createdAt.addingTimeInterval(Double(config.minutes) * 60)
                            return SLAAlert(entity: .lead(lead.id),
                                             config: config,
                                             violated: firstActivity.createdAt > dueDate,
                                             dueDate: dueDate)
                        case .stage_move:
                            return nil
                        }
                    }
            }
            .eraseToAnyPublisher()
    }

    func evaluate(for deal: Deal) -> AnyPublisher<[SLAAlert], Never> {
        repository.configurations()
            .replaceError(with: [])
            .map { configs -> [SLAAlert] in
                configs.filter { $0.active && $0.target == .stage_move }
                    .map { config in
                        let dueDate = (deal.expectedCloseAt ?? Date.now).addingTimeInterval(Double(config.minutes) * 60)
                        return SLAAlert(entity: .deal(deal.id),
                                        config: config,
                                        violated: Date.now > dueDate,
                                        dueDate: dueDate)
                    }
            }
            .eraseToAnyPublisher()
    }

    func scheduleReminder(for activity: Activity) {
        notificationScheduler.schedule(for: activity)
    }
}
