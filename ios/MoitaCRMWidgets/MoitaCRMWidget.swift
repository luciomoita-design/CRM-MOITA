import WidgetKit
import SwiftUI

struct TasksEntry: TimelineEntry {
    let date: Date
    let tasksDueToday: Int
    let dealsClosing: Int
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> TasksEntry {
        TasksEntry(date: Date(), tasksDueToday: 3, dealsClosing: 2)
    }

    func getSnapshot(in context: Context, completion: @escaping (TasksEntry) -> Void) {
        completion(TasksEntry(date: Date(), tasksDueToday: 3, dealsClosing: 2))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TasksEntry>) -> Void) {
        let entry = TasksEntry(date: Date(), tasksDueToday: 3, dealsClosing: 1)
        completion(Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3600))))
    }
}

struct MoitaCRMWidgetEntryView: View {
    var entry: Provider.Entry

    var body: some View {
        VStack(alignment: .leading) {
            Text("Tarefas de hoje: \(entry.tasksDueToday)")
            Text("Deals na semana: \(entry.dealsClosing)")
        }
        .padding()
    }
}

struct MoitaCRMWidget: Widget {
    let kind: String = "MoitaCRMWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            MoitaCRMWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Moita CRM")
        .description("Acompanhe suas tarefas e negócios.")
        .supportedFamilies([.systemSmall])
    }
}

struct MoitaCRMWidgetBundle: WidgetBundle {
    var body: some Widget {
        MoitaCRMWidget()
    }
}
