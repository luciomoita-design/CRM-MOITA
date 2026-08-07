import Foundation
import Combine

@MainActor
final class ScoringDashboardViewModel: ObservableObject {
    @Published var rules: [ScoringRule] = []
    private let scoringService: ScoringService
    private let leadRepository: LeadRepository
    private let ruleRepository: ScoringRuleRepository
    private var cancellables: Set<AnyCancellable> = []

    init(scoringService: ScoringService = DependencyContainer.shared.scoringService,
         leadRepository: LeadRepository = DependencyContainer.shared.leadRepository,
         ruleRepository: ScoringRuleRepository = SwiftDataScoringRuleRepository(context: ModelContext(PersistenceController.shared.container))) {
        self.scoringService = scoringService
        self.leadRepository = leadRepository
        self.ruleRepository = ruleRepository
    }

    func load() {
        ruleRepository.rules()
            .receive(on: DispatchQueue.main)
            .sink { completion in
                if case let .failure(error) = completion {
                    print("Failed to load rules: \(error)")
                }
            } receiveValue: { [weak self] rules in
                self?.rules = rules
            }
            .store(in: &cancellables)
    }

    func rescoreAll() {
        leadRepository.leads(query: LeadQuery())
            .flatMap { leads -> AnyPublisher<Void, Error> in
                let publishers = leads.map { self.scoringService.rescore(lead: $0) }
                return Publishers.MergeMany(publishers).map { _ in }.eraseToAnyPublisher()
            }
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { completion in
                if case let .failure(error) = completion {
                    print("Failed to rescore all: \(error)")
                }
            }, receiveValue: { })
            .store(in: &cancellables)
    }
}
