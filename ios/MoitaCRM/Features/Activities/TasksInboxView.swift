import SwiftUI

struct TasksInboxView: View {
    @StateObject private var viewModel = TasksInboxViewModel()

    var body: some View {
        NavigationStack {
            List {
                ForEach(viewModel.sections) { section in
                    Section(section.title) {
                        ForEach(section.activities) { activity in
                            ActivityRowView(activity: activity)
                                .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                    Button("Concluir") {
                                        viewModel.complete(activity: activity)
                                    }
                                    .tint(.green)
                                }
                        }
                    }
                }
            }
            .navigationTitle("Tarefas")
            .onAppear { viewModel.load() }
        }
    }
}

struct ActivityRowView: View {
    let activity: Activity

    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundStyle(.accent)
            VStack(alignment: .leading) {
                Text(activity.title)
                Text(activity.dueAt, style: .time)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            if activity.doneAt != nil {
                Image(systemName: "checkmark.circle.fill").foregroundStyle(.green)
            }
        }
    }

    private var icon: String {
        switch activity.type {
        case .call: return "phone"
        case .meet: return "person.2"
        case .email: return "envelope"
        case .whatsapp: return "message"
        case .task: return "checkmark.circle"
        }
    }
}
