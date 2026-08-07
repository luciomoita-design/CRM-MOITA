import SwiftUI

struct PipelineBoardView: View {
    @StateObject private var viewModel = PipelineBoardViewModel()
    @State private var selectedPipelineId = UUID(uuidString: "11111111-1111-1111-1111-111111111111")!

    var body: some View {
        NavigationStack {
            ScrollView(.horizontal) {
                HStack(alignment: .top, spacing: 16) {
                    ForEach(viewModel.columns) { column in
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text(column.stage.name)
                                    .font(.headline)
                                Spacer()
                                Text(column.expectedValue.formatted(.currency(code: "BRL")))
                                    .font(.footnote)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(.bottom, 4)

                            ForEach(column.deals, id: \.id) { deal in
                                DealCardView(deal: deal)
                                    .onDrag {
                                        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                                        return NSItemProvider(object: deal.id.uuidString as NSString)
                                    }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(8)
                            .background(RoundedRectangle(cornerRadius: 12).fill(Color(.systemGray6)))
                        }
                        .padding()
                        .frame(width: 280)
                        .background(RoundedRectangle(cornerRadius: 16).fill(.thinMaterial))
                        .dropDestination(for: String.self) { items, _ in
                            guard let dealIdString = items.first, let dealId = UUID(uuidString: dealIdString) else { return false }
                            guard let stage = viewModel.columns.first(where: { $0.id == column.id })?.stage else { return false }
                            if let deal = viewModel.columns.flatMap({ $0.deals }).first(where: { $0.id == dealId }) {
                                viewModel.move(deal: deal, to: stage)
                            }
                            UIImpactFeedbackGenerator(style: .rigid).impactOccurred()
                            return true
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Pipeline")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Sincronizar") {
                        _ = DependencyContainer.shared.syncService.syncNow().sink(receiveCompletion: { _ in }, receiveValue: { })
                    }
                }
            }
            .onAppear {
                viewModel.load(pipelineId: selectedPipelineId)
            }
        }
    }
}

struct DealCardView: View {
    let deal: Deal

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(deal.lead?.name ?? "Lead")
                .font(.headline)
            Text(deal.amountBRL.formatted(.currency(code: deal.currency)))
                .font(.subheadline)
            Text("Probabilidade: \(Int(deal.probability * 100))%")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Negócio de \(deal.lead?.name ?? "Lead") no valor de \(deal.amountBRL.formatted(.currency(code: deal.currency)))")
    }
}
