import AppIntents

struct QuickCreateLeadIntent: AppIntent {
    static var title: LocalizedStringResource = "Criar lead rápido"

    func perform() async throws -> some IntentResult {
        NotificationCenter.default.post(name: .quickAddLeadShortcut, object: nil)
        return .result(dialog: "Lead criado rapidamente")
    }
}

struct LogActivityIntent: AppIntent {
    static var title: LocalizedStringResource = "Registrar atividade"

    @Parameter(title: "Título")
    var title: String

    func perform() async throws -> some IntentResult {
        return .result(dialog: "Atividade \(title) registrada")
    }
}
