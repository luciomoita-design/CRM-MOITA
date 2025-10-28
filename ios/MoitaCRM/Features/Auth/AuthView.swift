import SwiftUI

struct AuthView: View {
    @StateObject private var viewModel = AuthViewModel()

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "leaf")
                .font(.system(size: 64))
            Text("Moita CRM")
                .font(.largeTitle.bold())
            TextField("E-mail", text: $viewModel.email)
                .textContentType(.username)
                .textInputAutocapitalization(.never)
                .padding()
                .background(RoundedRectangle(cornerRadius: 12).fill(Color(.systemGray6)))
            SecureField("Senha", text: $viewModel.password)
                .padding()
                .background(RoundedRectangle(cornerRadius: 12).fill(Color(.systemGray6)))
            Button(action: viewModel.login) {
                Text("Entrar")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)

            if let error = viewModel.error {
                Text(error)
                    .foregroundStyle(.red)
            }
        }
        .padding()
    }
}
