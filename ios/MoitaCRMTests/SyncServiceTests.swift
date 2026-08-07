import XCTest
import Combine
@testable import MoitaCRM

final class SyncServiceTests: XCTestCase {
    func testSyncProcessesJobs() {
        let queue = InMemorySyncQueueRepository()
        let client = MockAPIClient()
        let service = DefaultSyncService(queueRepository: queue, apiClient: client)

        queue.enqueue(SyncJob(endpoint: "/leads", payload: .lead(UUID())))
        let expectation = expectation(description: "sync")
        _ = service.syncNow()
            .sink(receiveCompletion: { completion in
                if case let .failure(error) = completion {
                    XCTFail("Unexpected error \(error)")
                }
                expectation.fulfill()
            }, receiveValue: { })
        wait(for: [expectation], timeout: 2)
        XCTAssertTrue(client.called)
    }
}

private final class MockAPIClient: APIClient {
    var called = false

    func request(endpoint: String, method: String, payload: Encodable?) -> AnyPublisher<Data, Error> {
        called = true
        return Just(Data()).setFailureType(to: Error.self).eraseToAnyPublisher()
    }

    func request(endpoint: String, method: String, payload: SyncJobPayload) -> AnyPublisher<Data, Error> {
        called = true
        return Just(Data()).setFailureType(to: Error.self).eraseToAnyPublisher()
    }
}
