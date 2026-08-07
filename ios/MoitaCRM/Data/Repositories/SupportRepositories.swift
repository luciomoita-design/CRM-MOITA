import Foundation
import Combine
import SwiftData
import UserNotifications

final class LocalAuditLogRepository: AuditLogRepository {
    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    func record(_ log: AuditLog) -> AnyPublisher<Void, Error> {
        Future { promise in
            self.context.insert(log)
            do {
                try self.context.save()
                promise(.success(()))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
}

final class SwiftDataScoringRuleRepository: ScoringRuleRepository {
    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    func rules() -> AnyPublisher<[ScoringRule], Error> {
        Future { promise in
            let descriptor = FetchDescriptor<ScoringRule>()
            do {
                let rules = try self.context.fetch(descriptor)
                promise(.success(rules))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
}

final class SwiftDataSLARepository: SLARepository {
    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    func configurations() -> AnyPublisher<[SLAConfig], Error> {
        Future { promise in
            let descriptor = FetchDescriptor<SLAConfig>()
            do {
                let configs = try self.context.fetch(descriptor)
                promise(.success(configs))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
}

struct LocalNotificationScheduler: NotificationScheduling {
    init() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { _, _ in }
    }

    func schedule(for activity: Activity) {
        let content = UNMutableNotificationContent()
        content.title = "Lembrete: \(activity.title)"
        content.body = activity.notes
        content.sound = .default

        let triggerDate = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: activity.dueAt)
        let trigger = UNCalendarNotificationTrigger(dateMatching: triggerDate, repeats: false)
        let request = UNNotificationRequest(identifier: activity.id.uuidString, content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request)
    }

    func cancel(for activityId: UUID) {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [activityId.uuidString])
    }
}
