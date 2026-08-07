import SwiftUI

struct LeadListView: View {
    @StateObject private var viewModel = LeadListViewModel()
    @State private var path: [Lead] = []

    var body: some View {
        NavigationStack(path: $path) {
            List(viewModel.leads) { lead in
                NavigationLink(value: lead) {
                    LeadRowView(lead: lead)
                }
                .swipeActions(edge: .trailing) {
                    Button("Recalcular") {
                        viewModel.recalculateScore(for: lead)
                    }
                    .tint(.orange)
                }
                .disabled(!lead.consentToContact)
            }
            .overlay { if viewModel.isLoading { ProgressView() } }
            .searchable(text: $viewModel.searchText, prompt: "Buscar leads")
            .navigationDestination(for: Lead.self) { lead in
                LeadDetailView(lead: lead)
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Toggle(isOn: $viewModel.onlyConsent) {
                        Label("Consentimento", systemImage: "hand.raised")
                    }
                    .toggleStyle(.switch)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        if let first = viewModel.leads.first {
                            path = [first]
                        }
                    } label: {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                    }
                    .accessibilityLabel("Filtros salvos")
                }
            }
            .navigationTitle("Leads")
            .onAppear { viewModel.load() }
        }
    }
}

struct LeadRowView: View {
    let lead: Lead

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(lead.name)
                    .font(.headline)
                Spacer()
                Text("Score: \(lead.score)")
                    .bold()
                    .foregroundStyle(lead.score > 70 ? .green : .primary)
            }
            Text(lead.company)
                .font(.subheadline)
            Text(lead.source)
                .font(.caption)
                .foregroundStyle(.secondary)
            if !lead.consentToContact {
                Label("Sem consentimento", systemImage: "hand.raised.slash")
                    .font(.caption)
                    .foregroundStyle(.red)
            }
        }
    }
}
