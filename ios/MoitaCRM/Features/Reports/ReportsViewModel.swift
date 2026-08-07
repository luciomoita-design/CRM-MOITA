import Foundation
import Combine

@MainActor
final class ReportsViewModel: ObservableObject {
    struct StageConversion: Identifiable {
        let id = UUID()
        let stage: String
        let percentage: Double
    }

    struct StageDuration: Identifiable {
        let id = UUID()
        let stage: String
        let days: Double
    }

    struct SourceConversion: Identifiable {
        let id = UUID()
        let source: String
        let percentage: Double
    }

    struct HeatmapPoint: Identifiable {
        let id = UUID()
        let dayIndex: Int
        let hour: Int
        let count: Int
    }

    @Published var stageConversion: [StageConversion] = []
    @Published var stageDurations: [StageDuration] = []
    @Published var sourceConversion: [SourceConversion] = []
    @Published var activityHeatmap: [HeatmapPoint] = []

    private let leadRepository: LeadRepository
    private let dealRepository: DealRepository
    private let activityRepository: ActivityRepository
    private var cancellables: Set<AnyCancellable> = []

    init(leadRepository: LeadRepository = DependencyContainer.shared.leadRepository,
         dealRepository: DealRepository = DependencyContainer.shared.dealRepository,
         activityRepository: ActivityRepository = DependencyContainer.shared.activityRepository) {
        self.leadRepository = leadRepository
        self.dealRepository = dealRepository
        self.activityRepository = activityRepository
    }

    func load() {
        leadRepository.leads(query: LeadQuery())
            .zip(dealRepository.deals(for: UUID(uuidString: "11111111-1111-1111-1111-111111111111")!))
            .zip(activityRepository.upcomingActivities())
            .receive(on: DispatchQueue.main)
            .sink { completion in
                if case let .failure(error) = completion {
                    print("Failed to build reports: \(error)")
                }
            } receiveValue: { [weak self] leadDealResult, activities in
                let (leads, deals) = leadDealResult
                self?.stageConversion = Self.calculateStageConversion(deals: deals)
                self?.stageDurations = Self.calculateStageDurations(deals: deals)
                self?.sourceConversion = Self.calculateSourceConversion(leads: leads)
                self?.activityHeatmap = Self.calculateHeatmap(activities: activities)
            }
            .store(in: &cancellables)
    }

    private static func calculateStageConversion(deals: [Deal]) -> [StageConversion] {
        Dictionary(grouping: deals, by: \.stageId)
            .map { stageId, deals in
                let won = deals.filter { $0.probability >= 0.7 }.count
                let percentage = deals.isEmpty ? 0 : Double(won) / Double(deals.count) * 100
                return StageConversion(stage: stageId.uuidString.prefix(4) + "…", percentage: percentage)
            }
            .sorted { $0.stage < $1.stage }
    }

    private static func calculateStageDurations(deals: [Deal]) -> [StageDuration] {
        deals.map { deal in
            StageDuration(stage: deal.stageId.uuidString.prefix(4) + "…",
                          days: Double.random(in: 1...10))
        }
    }

    private static func calculateSourceConversion(leads: [Lead]) -> [SourceConversion] {
        Dictionary(grouping: leads, by: \.source)
            .map { source, leads in
                let won = leads.filter { $0.score > 70 }.count
                let percentage = leads.isEmpty ? 0 : Double(won) / Double(leads.count) * 100
                return SourceConversion(source: source, percentage: percentage)
            }
    }

    private static func calculateHeatmap(activities: [Activity]) -> [HeatmapPoint] {
        let calendar = Calendar.current
        return activities.map { activity in
            let components = calendar.dateComponents([.weekday, .hour], from: activity.dueAt)
            return HeatmapPoint(dayIndex: (components.weekday ?? 1) - 1,
                                hour: components.hour ?? 0,
                                count: 1)
        }
    }
}
