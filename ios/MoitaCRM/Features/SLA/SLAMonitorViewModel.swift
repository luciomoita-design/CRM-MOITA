import Foundation
import Combine

@MainActor
final class SLAMonitorViewModel: ObservableObject {
    @Published var alerts: [SLAAlert] = []

    private let slaService: SLAService
    private let leadRepository: LeadRepository
    private var cancellables: Set<AnyCancellable> = []

    init(slaService: SLAService = DependencyContainer.shared.slaService,
         leadRepository: LeadRepository = DependencyContainer.shared.leadRepository) {
        self.slaService = slaService
        self.leadRepository = leadRepository
    }

    func refresh() {
        leadRepository.leads(query: LeadQuery())
            .flatMap { leads -> AnyPublisher<[SLAAlert], Never> in
                let publishers = leads.map { self.slaService.evaluate(for: $0) }
                return Publishers.MergeMany(publishers).collect().map { $0.flatMap { $0 } }.eraseToAnyPublisher()
            }
            .receive(on: DispatchQueue.main)
            .sink { [weak self] alerts in
                self?.alerts = alerts
            }
            .store(in: &cancellables)
    }
}
