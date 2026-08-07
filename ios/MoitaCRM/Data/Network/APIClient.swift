import Foundation
import Combine

protocol APIClient {
    func request(endpoint: String, method: String, payload: Encodable?) -> AnyPublisher<Data, Error>
    func request(endpoint: String, method: String, payload: SyncJobPayload) -> AnyPublisher<Data, Error>
}

final class RESTAPIClient: APIClient {
    struct Configuration {
        let baseURL: URL
        let session: URLSession
    }

    private let configuration: Configuration
    private let encoder: JSONEncoder

    init(configuration: Configuration) {
        self.configuration = configuration
        self.encoder = JSONEncoder()
        self.encoder.dateEncodingStrategy = .iso8601
    }

    func request(endpoint: String, method: String = "GET", payload: Encodable? = nil) -> AnyPublisher<Data, Error> {
        var request = URLRequest(url: configuration.baseURL.appendingPathComponent(endpoint))
        request.httpMethod = method
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        if let payload {
            request.httpBody = try? encoder.encode(AnyEncodable(payload))
        }
        return configuration.session.dataTaskPublisher(for: request)
            .map(\ .data)
            .mapError { $0 as Error }
            .eraseToAnyPublisher()
    }

    func request(endpoint: String, method: String, payload: SyncJobPayload) -> AnyPublisher<Data, Error> {
        do {
            let data = try encoder.encode(payload)
            return request(endpoint: endpoint, method: method, payload: RawDataEncodable(data: data))
        } catch {
            return Fail(error: error).eraseToAnyPublisher()
        }
    }
}

struct AnyEncodable: Encodable {
    let wrapped: Encodable

    init(_ wrapped: Encodable) {
        self.wrapped = wrapped
    }

    func encode(to encoder: Encoder) throws {
        try wrapped.encode(to: encoder)
    }
}

struct RawDataEncodable: Encodable {
    let data: Data

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        try container.encode(data)
    }
}
