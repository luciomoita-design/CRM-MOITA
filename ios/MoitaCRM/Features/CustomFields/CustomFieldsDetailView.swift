import SwiftUI

struct CustomFieldsDetailView: View {
    @StateObject private var viewModel = CustomFieldsViewModel()
    let entityId: UUID
    let scope: CustomFieldScope

    var body: some View {
        Form {
            ForEach(viewModel.definitions) { definition in
                CustomFieldValueView(definition: definition, value: viewModel.value(for: definition, entityId: entityId)) { newValue in
                    viewModel.setValue(newValue, definition: definition, entityId: entityId)
                }
            }
        }
        .onAppear { viewModel.load(scope: scope) }
    }
}

struct CustomFieldValueView: View {
    let definition: CustomFieldDefinition
    @State var value: String
    let onUpdate: (String) -> Void

    var body: some View {
        switch definition.kind {
        case .text:
            TextField(definition.label, text: Binding(
                get: { value },
                set: { value = $0; onUpdate($0) }
            ))
        case .number:
            TextField(definition.label, text: Binding(
                get: { value },
                set: { value = $0.filter { $0.isNumber || $0 == "," || $0 == "." }; onUpdate(value) }
            ))
            .keyboardType(.decimalPad)
        case .date:
            DatePicker(definition.label, selection: Binding(
                get: { ISO8601DateFormatter().date(from: value) ?? Date() },
                set: { value = ISO8601DateFormatter().string(from: $0); onUpdate(value) }
            ), displayedComponents: .date)
        case .select:
            Picker(definition.label, selection: Binding(
                get: { value },
                set: { value = $0; onUpdate($0) }
            )) {
                ForEach(definition.options, id: \.self, content: Text.init)
            }
        case .multiselect:
            NavigationLink {
                List(definition.options, id: \.self, selection: Binding(
                    get: { Set(value.split(separator: ",").map(String.init)) },
                    set: { value = $0.joined(separator: ","); onUpdate(value) }
                )) { option in
                    Text(option)
                }
                .environment(\ .editMode, .constant(.active))
            } label: {
                HStack {
                    Text(definition.label)
                    Spacer()
                    Text(value)
                        .foregroundStyle(.secondary)
                }
            }
        case .bool:
            Toggle(definition.label, isOn: Binding(
                get: { (value as NSString).boolValue },
                set: { value = $0.description; onUpdate(value) }
            ))
        }
    }
}
