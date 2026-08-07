import Foundation
import Combine

@MainActor
final class AuthViewModel: ObservableObject {
    @Published var email = ""
    @Published var password = ""
    @Published var isAuthenticated = false
    @Published var error: String?

    private let keychain: KeychainStorage

    init(keychain: KeychainStorage = SecureKeychainStorage()) {
        self.keychain = keychain
    }

    func login() {
        guard !email.isEmpty else {
            error = "Informe o e-mail"
            return
        }
        Task {
            try? keychain.store(token: UUID().uuidString, for: "authToken")
            await MainActor.run {
                self.isAuthenticated = true
            }
        }
    }

    func logout() {
        try? keychain.removeToken(for: "authToken")
        isAuthenticated = false
    }
}
