import SwiftUI

struct DealQuickEditorView: View {
    let lead: Lead
    var onSave: (Deal) -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var amount: Double = 0
    @State private var stageId: UUID?
    @State private var probability: Double = 0.5
    @State private var expectedClose = Date().addingTimeInterval(86400 * 7)

    var body: some View {
        NavigationStack {
            Form {
                Section("Negócio") {
                    Text(lead.name)
                    TextField("Valor (BRL)", value: $amount, format: .currency(code: "BRL"))
                        .keyboardType(.decimalPad)
                    Slider(value: $probability, in: 0...1) {
                        Text("Probabilidade")
                    }
                    DatePicker("Fechamento", selection: $expectedClose)
                }
            }
            .navigationTitle("Novo negócio")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salvar") {
                        let deal = Deal(lead: lead,
                                        pipelineId: UUID(uuidString: "11111111-1111-1111-1111-111111111111")!,
                                        stageId: stageId ?? UUID(),
                                        amountBRL: Decimal(amount),
                                        currency: "BRL",
                                        probability: probability,
                                        expectedCloseAt: expectedClose,
                                        ownerId: lead.ownerId)
                        onSave(deal)
                        dismiss()
                    }
                }
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar", action: dismiss.callAsFunction)
                }
            }
        }
    }
}
