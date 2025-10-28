import SwiftUI

struct SLAMonitorView: View {
    @StateObject private var viewModel = SLAMonitorViewModel()

    var body: some View {
        List(viewModel.alerts) { alert in
            HStack {
                VStack(alignment: .leading) {
                    Text(alert.config.name)
                    Text(alert.dueDate, style: .date)
                        .font(.caption)
                }
                Spacer()
                if alert.violated {
                    Text("Violado")
                        .foregroundStyle(.red)
                        .bold()
                }
            }
        }
        .navigationTitle("SLA")
        .onAppear { viewModel.refresh() }
    }
}
