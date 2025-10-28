import SwiftUI
import SwiftData

@main
struct MoitaCRMApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    private let persistence = PersistenceController.shared
    @StateObject private var remoteToggle = RemoteToggle()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .modelContainer(persistence.container)
                .environmentObject(remoteToggle)
        }
        .commands {
            CommandGroup(replacing: .newItem) {
                Button("Novo lead") {
                    NotificationCenter.default.post(name: .quickAddLeadShortcut, object: nil)
                }
                .keyboardShortcut("n", modifiers: [.command])
            }
        }

        WidgetBundle
        { MoitaCRMWidgetBundle() }
    }
}

final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        DemoDataSeeder.shared.seedIfNeeded()
        return true
    }
}

private struct ContentView: View {
    @StateObject private var appRouter = AppRouter()

    var body: some View {
        MainTabView()
            .environmentObject(appRouter)
    }
}
