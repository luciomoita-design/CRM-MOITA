import Foundation
import SwiftData

final class DemoDataSeeder {
    static let shared = DemoDataSeeder()
    private let context: ModelContext

    private init() {
        context = ModelContext(PersistenceController.shared.container)
    }

    func seedIfNeeded() {
        let descriptor = FetchDescriptor<Lead>(fetchLimit: 1)
        if let _ = try? context.fetch(descriptor).first {
            return
        }

        let pipeline = Pipeline(id: UUID(uuidString: "11111111-1111-1111-1111-111111111111")!, name: "Padrão BR", order: 0)
        let stages = [
            Stage(id: UUID(uuidString: "22222222-1111-1111-1111-111111111111")!, pipeline: pipeline, name: "Prospecção", order: 0, probability: 0.1),
            Stage(id: UUID(uuidString: "22222222-2222-1111-1111-111111111111")!, pipeline: pipeline, name: "Qualificado", order: 1, probability: 0.3),
            Stage(id: UUID(uuidString: "22222222-3333-1111-1111-111111111111")!, pipeline: pipeline, name: "Proposta", order: 2, probability: 0.5),
            Stage(id: UUID(uuidString: "22222222-4444-1111-1111-111111111111")!, pipeline: pipeline, name: "Fechamento", order: 3, probability: 0.7),
            Stage(id: UUID(uuidString: "22222222-5555-1111-1111-111111111111")!, pipeline: pipeline, name: "Ganhou", order: 4, probability: 0.9),
            Stage(id: UUID(uuidString: "22222222-6666-1111-1111-111111111111")!, pipeline: pipeline, name: "Perdido", order: 5, probability: 0.1)
        ]
        pipeline.stages = stages

        context.insert(pipeline)
        stages.forEach(context.insert)

        let users = [
            User(id: UUID(uuidString: "aaaaaaaa-0000-0000-0000-000000000001")!, name: "Ana Admin", email: "ana@moita.app", role: .admin, timezone: "America/Sao_Paulo"),
            User(id: UUID(uuidString: "aaaaaaaa-0000-0000-0000-000000000002")!, name: "Marcos Manager", email: "marcos@moita.app", role: .manager, timezone: "America/Sao_Paulo"),
            User(id: UUID(uuidString: "aaaaaaaa-0000-0000-0000-000000000003")!, name: "Renata Rep", email: "renata@moita.app", role: .rep, timezone: "America/Sao_Paulo")
        ]
        users.forEach(context.insert)

        let leadSources = ["Referral", "Orgânico", "Ads"]
        let statuses = ["Novo", "Ativo", "Reengajar"]
        for index in 0..<20 {
            let lead = Lead(orgId: UUID(),
                            name: "Lead \(index + 1)",
                            company: "Empresa \(index + 1)",
                            email: "lead\(index + 1)@empresa.com",
                            phone: "+55 (11) 98888-\(String(format: "%04d", index))",
                            source: leadSources.randomElement()!,
                            ownerId: users.randomElement()!.id,
                            score: Int.random(in: 40...90),
                            status: statuses.randomElement()!,
                            consentToContact: Bool.random())
            context.insert(lead)

            if index < 10 {
                let stage = stages[index % stages.count]
                let deal = Deal(lead: lead,
                                pipelineId: pipeline.id,
                                stageId: stage.id,
                                amountBRL: Decimal(Double.random(in: 5000...30000)),
                                currency: "BRL",
                                probability: stage.probability,
                                expectedCloseAt: Calendar.current.date(byAdding: .day, value: 14 + index, to: .now),
                                ownerId: lead.ownerId)
                context.insert(deal)
            }
        }

        let rules = [
            ScoringRule(name: "Origem qualificada", weight: 20, conditionJSON: "{\"field\":\"source\",\"op\":\"in\",\"value\":[\"Referral\",\"Orgânico\"]}"),
            ScoringRule(name: "Consentimento", weight: 15, conditionJSON: "{\"field\":\"consentToContact\",\"op\":\"eq\",\"value\":true}"),
            ScoringRule(name: "Score alto", weight: 10, conditionJSON: "{\"field\":\"score\",\"op\":\"gt\",\"value\":70}")
        ]
        rules.forEach(context.insert)

        let sla = SLAConfig(name: "Primeiro contato 24h", target: .first_contact, minutes: 1440, active: true)
        context.insert(sla)

        try? context.save()
    }
}
