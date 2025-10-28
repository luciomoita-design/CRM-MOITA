import Foundation
import Combine

@MainActor
final class PipelineBoardViewModel: ObservableObject {
    struct Column: Identifiable {
        let id: UUID
        let stage: Stage
        var deals: [Deal]
        var expectedValue: Decimal {
            deals.reduce(0) { $0 + $1.amountBRL * Decimal($1.probability) }
        }
    }

    @Published var columns: [Column] = []
    @Published var isLoading = false

    private let dealRepository: DealRepository
    private let stageRepository: StageRepository
    private var cancellables: Set<AnyCancellable> = []

    init(dealRepository: DealRepository = DependencyContainer.shared.dealRepository,
         stageRepository: StageRepository = MockStageRepository()) {
        self.dealRepository = dealRepository
        self.stageRepository = stageRepository
    }

    func load(pipelineId: UUID) {
        isLoading = true
        stageRepository.stages(for: pipelineId)
            .receive(on: DispatchQueue.main)
            .flatMap { stages -> AnyPublisher<[Column], Error> in
                let publisher = stages.publisher.flatMap { stage in
                    self.dealRepository.deals(for: pipelineId)
                        .map { deals -> Column in
                            let filtered = deals.filter { $0.stageId == stage.id }
                            return Column(id: stage.id, stage: stage, deals: filtered)
                        }
                }
                return publisher.collect().eraseToAnyPublisher()
            }
            .sink { [weak self] completion in
                if case .failure(let error) = completion {
                    print("Failed to load pipeline: \(error)")
                }
                self?.isLoading = false
            } receiveValue: { [weak self] columns in
                self?.columns = columns.sorted { $0.stage.order < $1.stage.order }
            }
            .store(in: &cancellables)
    }

    func move(deal: Deal, to stage: Stage) {
        guard let index = columns.firstIndex(where: { $0.stage.id == stage.id }) else { return }
        columns[index].deals.append(deal)
    }
}

final class MockStageRepository: StageRepository {
    func stages(for pipelineId: UUID) -> AnyPublisher<[Stage], Error> {
        let pipeline = Pipeline(id: pipelineId, name: "Padrão BR", order: 0)
        let stages = [
            Stage(pipeline: pipeline, name: "Prospecção", order: 0, probability: 0.1),
            Stage(pipeline: pipeline, name: "Qualificado", order: 1, probability: 0.3),
            Stage(pipeline: pipeline, name: "Proposta", order: 2, probability: 0.5)
        ]
        return Just(stages)
            .setFailureType(to: Error.self)
            .eraseToAnyPublisher()
    }
}
