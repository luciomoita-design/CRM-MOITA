import Foundation
import Combine

@MainActor
final class CustomFieldsViewModel: ObservableObject {
    @Published var definitions: [CustomFieldDefinition] = []

    private let repository: CustomFieldRepository
    private var cancellables: Set<AnyCancellable> = []
    private var values: [UUID: [UUID: CustomFieldValue]] = [:]

    init(repository: CustomFieldRepository = MockCustomFieldRepository()) {
        self.repository = repository
    }

    func load(scope: CustomFieldScope) {
        repository.definitions(scope: scope)
            .receive(on: DispatchQueue.main)
            .sink { completion in
                if case let .failure(error) = completion {
                    print("Failed to load custom fields: \(error)")
                }
            } receiveValue: { [weak self] definitions in
                self?.definitions = definitions
            }
            .store(in: &cancellables)
    }

    func value(for definition: CustomFieldDefinition, entityId: UUID) -> String {
        values[entityId]?[definition.id]?.valueJSON ?? ""
    }

    func setValue(_ value: String, definition: CustomFieldDefinition, entityId: UUID) {
        let storedValue = CustomFieldValue(definitionId: definition.id, entityId: entityId, valueJSON: value)
        var entityValues = values[entityId] ?? [:]
        entityValues[definition.id] = storedValue
        values[entityId] = entityValues
    }
    func create(definition: CustomFieldDefinition, scope: CustomFieldScope) {
        _ = repository.save(definition: definition)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { completion in
                if case let .failure(error) = completion {
                    print("Failed to save custom field: \(error)")
                }
            }, receiveValue: { [weak self] _ in
                self?.load(scope: scope)
            })
            .store(in: &cancellables)
    }
}

final class MockCustomFieldRepository: CustomFieldRepository {
    func definitions(scope: CustomFieldScope) -> AnyPublisher<[CustomFieldDefinition], Error> {
        let defs = [
            CustomFieldDefinition(scope: scope, key: "segment", label: "Segmento", kind: .select, options: ["SaaS", "Indústria"], required: false),
            CustomFieldDefinition(scope: scope, key: "size", label: "Tamanho", kind: .number, options: [], required: false)
        ]
        return Just(defs)
            .setFailureType(to: Error.self)
            .eraseToAnyPublisher()
    }

    func save(definition: CustomFieldDefinition) -> AnyPublisher<Void, Error> {
        Just(()).setFailureType(to: Error.self).eraseToAnyPublisher()
    }
}
