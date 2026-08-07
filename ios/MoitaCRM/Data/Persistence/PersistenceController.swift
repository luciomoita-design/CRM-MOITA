import Foundation
import SwiftData

final class PersistenceController {
    static let shared = PersistenceController()

    let container: ModelContainer

    init(inMemory: Bool = false) {
        let schema = Schema([
            User.self,
            Pipeline.self,
            Stage.self,
            Lead.self,
            Deal.self,
            Activity.self,
            CalendarEvent.self,
            CustomFieldDefinition.self,
            CustomFieldValue.self,
            ScoringRule.self,
            SLAConfig.self,
            AuditLog.self
        ])

        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: inMemory)
        do {
            container = try ModelContainer(for: schema, configurations: configuration)
        } catch {
            fatalError("Unable to create SwiftData container: \(error)")
        }
    }
}
