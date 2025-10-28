import Foundation
import Combine

@MainActor
final class TasksInboxViewModel: ObservableObject {
    struct SectionModel: Identifiable {
        let id = UUID()
        let title: String
        var activities: [Activity]
    }

    @Published var sections: [SectionModel] = []
    private let repository: ActivityRepository
    private let slaService: SLAService
    private let notificationScheduler: NotificationScheduling
    private var cancellables: Set<AnyCancellable> = []

    init(repository: ActivityRepository = DependencyContainer.shared.activityRepository,
         slaService: SLAService = DependencyContainer.shared.slaService,
         notificationScheduler: NotificationScheduling = LocalNotificationScheduler()) {
        self.repository = repository
        self.slaService = slaService
        self.notificationScheduler = notificationScheduler
    }

    func load() {
        repository.upcomingActivities()
            .receive(on: DispatchQueue.main)
            .sink { completion in
                if case let .failure(error) = completion {
                    print("Failed to load activities: \(error)")
                }
            } receiveValue: { [weak self] activities in
                self?.sections = self?.groupActivities(activities) ?? []
            }
            .store(in: &cancellables)
    }

    func complete(activity: Activity) {
        activity.doneAt = .now
        _ = repository.save(activity: activity)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { completion in
                if case let .failure(error) = completion {
                    print("Failed to complete activity: \(error)")
                }
            }, receiveValue: { [weak self] in self?.load() })
        notificationScheduler.cancel(for: activity.id)
    }

    private func groupActivities(_ activities: [Activity]) -> [SectionModel] {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        let week = calendar.date(byAdding: .day, value: 7, to: today) ?? today

        let todayActivities = activities.filter { calendar.isDate($0.dueAt, inSameDayAs: today) }
        let next7Days = activities.filter { $0.dueAt > today && $0.dueAt <= week }
        let overdue = activities.filter { $0.dueAt < today && $0.doneAt == nil }

        return [
            SectionModel(title: "Hoje", activities: todayActivities),
            SectionModel(title: "Próximos 7 dias", activities: next7Days),
            SectionModel(title: "Atrasadas", activities: overdue)
        ]
    }
}
