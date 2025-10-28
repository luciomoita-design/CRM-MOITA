import Foundation
import Combine

protocol SyncService {
    func enqueue(_ job: SyncJob)
    func syncNow() -> AnyPublisher<Void, Error>
}

enum SyncJobPayload: Codable {
    case lead(UUID)
    case deal(UUID)
    case activity(UUID)
    case webhook(String, payload: String)
}

struct SyncJob: Identifiable, Codable, Equatable {
    let id: UUID
    let endpoint: String
    let method: String
    let payload: SyncJobPayload
    let createdAt: Date

    init(id: UUID = UUID(), endpoint: String, method: String = "POST", payload: SyncJobPayload, createdAt: Date = .now) {
        self.id = id
        self.endpoint = endpoint
        self.method = method
        self.payload = payload
        self.createdAt = createdAt
    }
}

final class DefaultSyncService: SyncService {
    private let queueRepository: SyncQueueRepository
    private let apiClient: APIClient

    init(queueRepository: SyncQueueRepository, apiClient: APIClient) {
        self.queueRepository = queueRepository
        self.apiClient = apiClient
    }

    func enqueue(_ job: SyncJob) {
        queueRepository.enqueue(job)
    }

    func syncNow() -> AnyPublisher<Void, Error> {
        let jobs = queueRepository.pendingJobs()
        guard !jobs.isEmpty else {
            return Just(()).setFailureType(to: Error.self).eraseToAnyPublisher()
        }

        let publishers = jobs.map { job in
            apiClient.request(endpoint: job.endpoint, method: job.method, payload: job.payload)
                .handleEvents(receiveOutput: { _ in self.queueRepository.remove(job) })
        }

        return Publishers.MergeMany(publishers)
            .collect()
            .map { _ in }
            .eraseToAnyPublisher()
    }
}
