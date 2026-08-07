import Foundation

final class InMemorySyncQueueRepository: SyncQueueRepository {
    private var jobs: [SyncJob] = []
    private let queue = DispatchQueue(label: "moita.sync.queue", qos: .background)

    func enqueue(_ job: SyncJob) {
        queue.sync {
            jobs.append(job)
        }
    }

    func pendingJobs() -> [SyncJob] {
        queue.sync { jobs }
    }

    func remove(_ job: SyncJob) {
        queue.sync {
            jobs.removeAll { $0.id == job.id }
        }
    }
}
