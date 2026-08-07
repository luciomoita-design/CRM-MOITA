import XCTest
import Combine
@testable import MoitaCRM

final class SLAServiceTests: XCTestCase {
    func testLeadSLAProducesViolation() {
        let repository = MockSLARepository()
        let activityRepository = MockActivityRepository()
        let scheduler = TestNotificationScheduler()
        let service = DefaultSLAService(repository: repository,
                                        activityRepository: activityRepository,
                                        notificationScheduler: scheduler)

        let lead = Lead(orgId: UUID(),
                        name: "Lead",
                        company: "Empresa",
                        email: "lead@example.com",
                        phone: "",
                        source: "Ads",
                        ownerId: UUID(),
                        score: 20,
                        status: "Novo",
                        consentToContact: true,
                        createdAt: Date().addingTimeInterval(-2000 * 60))

        let expectation = expectation(description: "sla")
        _ = service.evaluate(for: lead)
            .sink { alerts in
                XCTAssertTrue(alerts.contains { $0.violated })
                expectation.fulfill()
            }
        wait(for: [expectation], timeout: 2)
    }
}

private final class MockSLARepository: SLARepository {
    func configurations() -> AnyPublisher<[SLAConfig], Error> {
        let config = SLAConfig(name: "Primeiro contato", target: .first_contact, minutes: 60, active: true)
        return Just([config]).setFailureType(to: Error.self).eraseToAnyPublisher()
    }
}

private final class MockActivityRepository: ActivityRepository {
    func upcomingActivities() -> AnyPublisher<[Activity], Error> { Just([]).setFailureType(to: Error.self).eraseToAnyPublisher() }
    func save(activity: Activity) -> AnyPublisher<Void, Error> { Just(()).setFailureType(to: Error.self).eraseToAnyPublisher() }
}

private final class TestNotificationScheduler: NotificationScheduling {
    func schedule(for activity: Activity) {}
    func cancel(for activityId: UUID) {}
}
