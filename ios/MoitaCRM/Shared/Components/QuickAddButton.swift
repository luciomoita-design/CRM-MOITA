import SwiftUI

struct QuickAddButton: View {
    @EnvironmentObject private var router: AppRouter
    @State private var isPresenting = false

    var body: some View {
        Menu {
            Button { router.quickAdd.send(.lead) } label: {
                Label("Lead", systemImage: "person.badge.plus")
            }
            Button { router.quickAdd.send(.deal) } label: {
                Label("Negócio", systemImage: "briefcase")
            }
            Button { router.quickAdd.send(.task) } label: {
                Label("Tarefa", systemImage: "checklist")
            }
            Button { router.quickAdd.send(.event) } label: {
                Label("Evento", systemImage: "calendar.badge.plus")
            }
        } label: {
            Circle()
                .fill(Color.accentColor)
                .frame(width: 64, height: 64)
                .shadow(radius: 6)
                .overlay {
                    Image(systemName: "plus")
                        .font(.largeTitle.bold())
                        .foregroundStyle(.white)
                }
                .accessibilityLabel("Adicionar rápido")
        }
    }
}
