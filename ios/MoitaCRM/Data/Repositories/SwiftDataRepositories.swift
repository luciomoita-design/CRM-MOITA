import Foundation
import Combine
import SwiftData

final class SwiftDataLeadRepository: LeadRepository {
    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    func leads(query: LeadQuery) -> AnyPublisher<[Lead], Error> {
        let descriptor = FetchDescriptor<Lead>()
        return Future { promise in
            do {
                var results = try self.context.fetch(descriptor)
                if let search = query.search, !search.isEmpty {
                    results = results.filter { $0.name.localizedCaseInsensitiveContains(search) || $0.company.localizedCaseInsensitiveContains(search) }
                }
                if let ownerId = query.ownerId {
                    results = results.filter { $0.ownerId == ownerId }
                }
                if query.consentOnly {
                    results = results.filter { $0.consentToContact }
                }
                promise(.success(results))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }

    func lead(id: UUID) -> AnyPublisher<Lead?, Error> {
        Future { promise in
            let descriptor = FetchDescriptor<Lead>(predicate: #Predicate { $0.id == id })
            do {
                let result = try self.context.fetch(descriptor).first
                promise(.success(result))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }

    func save(lead: Lead) -> AnyPublisher<Void, Error> {
        Future { promise in
            do {
                if lead.persistentModelID == nil {
                    self.context.insert(lead)
                }
                try self.context.save()
                promise(.success(()))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }

    func delete(lead: Lead) -> AnyPublisher<Void, Error> {
        Future { promise in
            self.context.delete(lead)
            do {
                try self.context.save()
                promise(.success(()))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
}

final class SwiftDataDealRepository: DealRepository {
    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    func deals(for pipelineId: UUID) -> AnyPublisher<[Deal], Error> {
        Future { promise in
            let descriptor = FetchDescriptor<Deal>(predicate: #Predicate { $0.pipelineId == pipelineId })
            do {
                let results = try self.context.fetch(descriptor)
                promise(.success(results))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }

    func save(deal: Deal) -> AnyPublisher<Void, Error> {
        Future { promise in
            do {
                if deal.persistentModelID == nil {
                    self.context.insert(deal)
                }
                try self.context.save()
                promise(.success(()))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
}

final class SwiftDataActivityRepository: ActivityRepository {
    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    func upcomingActivities() -> AnyPublisher<[Activity], Error> {
        Future { promise in
            let descriptor = FetchDescriptor<Activity>(sortBy: [SortDescriptor(\.dueAt)])
            do {
                let results = try self.context.fetch(descriptor)
                promise(.success(results))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }

    func save(activity: Activity) -> AnyPublisher<Void, Error> {
        Future { promise in
            do {
                if activity.persistentModelID == nil {
                    self.context.insert(activity)
                }
                try self.context.save()
                promise(.success(()))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
}
