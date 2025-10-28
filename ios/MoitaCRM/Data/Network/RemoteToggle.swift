import Foundation
import Combine

final class RemoteToggle: ObservableObject {
    @Published var useMockServer: Bool
    private let defaults: UserDefaults
    private let key = "MoitaCRM.useMock"

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        if defaults.object(forKey: key) == nil {
            defaults.set(true, forKey: key)
        }
        self.useMockServer = defaults.bool(forKey: key)
    }

    func toggle() {
        useMockServer.toggle()
        defaults.set(useMockServer, forKey: key)
    }
}
