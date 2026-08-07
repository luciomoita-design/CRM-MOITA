import Foundation
import Combine

final class AppRouter: ObservableObject {
    enum Tab: Hashable {
        case pipelines
        case leads
        case tasks
        case calendar
        case reports
        case settings
    }

    @Published var selectedTab: Tab = .pipelines
    let quickAdd = PassthroughSubject<QuickAddAction, Never>()

    init() {
        NotificationCenter.default.addObserver(forName: .quickAddLeadShortcut, object: nil, queue: .main) { [weak self] _ in
            self?.quickAdd.send(.lead)
        }
    }
}

enum QuickAddAction {
    case lead
    case deal
    case task
    case event
}

extension Notification.Name {
    static let quickAddLeadShortcut = Notification.Name("moita.quickAddLead")
}
