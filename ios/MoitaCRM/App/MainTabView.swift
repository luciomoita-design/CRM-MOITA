import SwiftUI

struct MainTabView: View {
    @EnvironmentObject private var router: AppRouter

    var body: some View {
        TabView(selection: $router.selectedTab) {
            PipelineBoardView()
                .tabItem { Label("Pipelines", systemImage: "rectangle.grid.3x2") }
                .tag(AppRouter.Tab.pipelines)

            LeadListView()
                .tabItem { Label("Leads", systemImage: "person.3") }
                .tag(AppRouter.Tab.leads)

            TasksInboxView()
                .tabItem { Label("Tarefas", systemImage: "checkmark.circle") }
                .tag(AppRouter.Tab.tasks)

            CalendarDashboardView()
                .tabItem { Label("Calendário", systemImage: "calendar") }
                .tag(AppRouter.Tab.calendar)

            ReportsDashboardView()
                .tabItem { Label("Relatórios", systemImage: "chart.bar.doc.horizontal") }
                .tag(AppRouter.Tab.reports)

            SettingsView()
                .tabItem { Label("Config.", systemImage: "gearshape") }
                .tag(AppRouter.Tab.settings)
        }
        .overlay(alignment: .bottomTrailing) {
            QuickAddButton()
                .padding()
        }
    }
}
