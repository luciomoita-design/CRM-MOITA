import Foundation
import Combine

@MainActor
final class LeadListViewModel: ObservableObject {
    @Published var leads: [Lead] = []
    @Published var searchText: String = ""
    @Published var onlyConsent: Bool = false
    @Published var isLoading = false

    private let leadRepository: LeadRepository
    private let scoringService: ScoringService
    private var cancellables: Set<AnyCancellable> = []

    init(leadRepository: LeadRepository = DependencyContainer.shared.leadRepository,
         scoringService: ScoringService = DependencyContainer.shared.scoringService) {
        self.leadRepository = leadRepository
        self.scoringService = scoringService

        $searchText
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .removeDuplicates()
            .sink { [weak self] _ in self?.load() }
            .store(in: &cancellables)
        $onlyConsent
            .dropFirst()
            .sink { [weak self] _ in self?.load() }
            .store(in: &cancellables)
    }

    func load() {
        isLoading = true
        let query = LeadQuery(search: searchText.isEmpty ? nil : searchText, ownerId: nil, source: nil, consentOnly: onlyConsent)
        leadRepository.leads(query: query)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] completion in
                if case .failure(let error) = completion {
                    print("Failed to load leads: \(error)")
                }
                self?.isLoading = false
            } receiveValue: { [weak self] leads in
                self?.leads = leads.sorted { $0.updatedAt > $1.updatedAt }
            }
            .store(in: &cancellables)
    }

    func recalculateScore(for lead: Lead) {
        scoringService.rescore(lead: lead)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { completion in
                if case let .failure(error) = completion {
                    print("Failed to rescore lead: \(error)")
                }
            }, receiveValue: { _ in })
            .store(in: &cancellables)
    }
}
