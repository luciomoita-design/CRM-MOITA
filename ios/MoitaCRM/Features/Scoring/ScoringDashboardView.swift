import SwiftUI

struct ScoringDashboardView: View {
    @StateObject private var viewModel = ScoringDashboardViewModel()

    var body: some View {
        List(viewModel.rules) { rule in
            VStack(alignment: .leading) {
                Text(rule.name).font(.headline)
                Text("Peso: \(rule.weight)")
                    .font(.caption)
            }
        }
        .navigationTitle("Regras de Score")
        .toolbar {
            Button("Recalcular tudo", action: viewModel.rescoreAll)
        }
        .onAppear { viewModel.load() }
    }
}
