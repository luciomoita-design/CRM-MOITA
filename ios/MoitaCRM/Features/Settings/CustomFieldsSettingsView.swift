import SwiftUI

struct CustomFieldsSettingsView: View {
    @StateObject private var viewModel = CustomFieldsViewModel()
    @State private var selectedScope: CustomFieldScope = .lead
    @State private var showingCreate = false

    var body: some View {
        List {
            Picker("Escopo", selection: $selectedScope) {
                Text("Leads").tag(CustomFieldScope.lead)
                Text("Deals").tag(CustomFieldScope.deal)
            }
            .pickerStyle(.segmented)
            .onChange(of: selectedScope) { _, newValue in
                viewModel.load(scope: newValue)
            }

            ForEach(viewModel.definitions) { definition in
                VStack(alignment: .leading) {
                    Text(definition.label)
                        .font(.headline)
                    Text(definition.kind.rawValue.capitalized)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .navigationTitle("Campos personalizados")
        .toolbar {
            Button(action: { showingCreate = true }) {
                Image(systemName: "plus")
            }
        }
        .sheet(isPresented: $showingCreate) {
            CustomFieldCreateView(scope: selectedScope) { definition in
                viewModel.create(definition: definition, scope: selectedScope)
            }
        }
        .onAppear { viewModel.load(scope: selectedScope) }
    }
}

struct CustomFieldCreateView: View {
    let scope: CustomFieldScope
    let onSave: (CustomFieldDefinition) -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var label = ""
    @State private var key = ""
    @State private var kind: CustomFieldKind = .text
    @State private var options: String = ""
    @State private var required = false

    var body: some View {
        NavigationStack {
            Form {
                TextField("Label", text: $label)
                TextField("Chave", text: $key)
                Picker("Tipo", selection: $kind) {
                    ForEach(CustomFieldKind.allCases, id: \.self) { kind in
                        Text(kind.rawValue.capitalized).tag(kind)
                    }
                }
                if kind == .select || kind == .multiselect {
                    TextField("Opções (separadas por vírgula)", text: $options)
                }
                Toggle("Obrigatório", isOn: $required)
            }
            .navigationTitle("Novo campo")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar", action: dismiss.callAsFunction)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salvar") {
                        let definition = CustomFieldDefinition(scope: scope,
                                                               key: key,
                                                               label: label,
                                                               kind: kind,
                                                               options: options.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) },
                                                               required: required)
                        onSave(definition)
                        dismiss()
                    }
                    .disabled(label.isEmpty || key.isEmpty)
                }
            }
        }
    }
}
