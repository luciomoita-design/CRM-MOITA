import Foundation
import Combine

@MainActor
final class CalendarViewModel: ObservableObject {
    enum DisplayMode: CaseIterable {
        case month
        case week
        case day

        var title: String {
            switch self {
            case .month: return "Mês"
            case .week: return "Semana"
            case .day: return "Dia"
            }
        }
    }

    @Published var events: [CalendarEvent] = []
    @Published var displayMode: DisplayMode = .month
    @Published var showCreate = false

    private let repository: CalendarRepository
    private var cancellables: Set<AnyCancellable> = []

    init(repository: CalendarRepository = MockCalendarRepository()) {
        self.repository = repository
    }

    func load() {
        let range = DateInterval(start: .now, duration: 60 * 60 * 24 * 30)
        repository.events(range: range)
            .receive(on: DispatchQueue.main)
            .sink { completion in
                if case let .failure(error) = completion {
                    print("Failed to load events: \(error)")
                }
            } receiveValue: { [weak self] events in
                self?.events = events
            }
            .store(in: &cancellables)
    }

    func create(event: CalendarEvent) {
        _ = repository.save(event: event)
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { completion in
                if case let .failure(error) = completion {
                    print("Failed to save event: \(error)")
                }
            }, receiveValue: { [weak self] in
                self?.load()
            })
    }
}

final class MockCalendarRepository: CalendarRepository {
    func events(range: DateInterval) -> AnyPublisher<[CalendarEvent], Error> {
        let events = [
            CalendarEvent(title: "Reunião demo",
                           notes: "Apresentação Moita",
                           startAt: Date(),
                           endAt: Date().addingTimeInterval(3600),
                           allDay: false,
                           ownerId: UUID())
        ]
        return Just(events)
            .setFailureType(to: Error.self)
            .eraseToAnyPublisher()
    }

    func save(event: CalendarEvent) -> AnyPublisher<Void, Error> {
        Just(()).setFailureType(to: Error.self).eraseToAnyPublisher()
    }
}
