import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var router: AppRouter
    @State private var useMock = true

    var body: some View {
        NavigationStack {
            Form {
                Section("Rede") {
                    Toggle("Usar Mock Server", isOn: $useMock)
                        .onChange(of: useMock) { _, value in
                            DependencyContainer.shared.remoteToggle.useMockServer = value
                        }
                }

                Section("Campos") {
                    NavigationLink("Campos personalizados") {
                        CustomFieldsSettingsView()
                    }
                }

                Section("Autenticação") {
                    Button("Sair") {}
                }
            }
            .navigationTitle("Configurações")
        }
        .onAppear { useMock = DependencyContainer.shared.remoteToggle.useMockServer }
    }
}
