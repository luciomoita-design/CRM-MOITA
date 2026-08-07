import Foundation

struct LeadExporter {
    static func csv(for leads: [Lead]) -> String {
        let header = "Nome,Empresa,E-mail,Telefone,Origem,Score"
        let rows = leads.map { lead in
            "\(lead.name),\(lead.company),\(lead.email),\(lead.phone),\(lead.source),\(lead.score)"
        }
        return ([header] + rows).joined(separator: "\n")
    }

    static func json(for lead: Lead) -> String {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        guard let data = try? encoder.encode(LeadDTO(lead: lead)) else { return "{}" }
        return String(data: data, encoding: .utf8) ?? "{}"
    }
}

private struct LeadDTO: Codable {
    let id: UUID
    let name: String
    let company: String
    let email: String
    let phone: String
    let source: String
    let score: Int

    init(lead: Lead) {
        id = lead.id
        name = lead.name
        company = lead.company
        email = lead.email
        phone = lead.phone
        source = lead.source
        score = lead.score
    }
}
