import Foundation

extension String {
    func applyingPhoneMaskBR() -> String {
        let digits = filter { $0.isNumber }
        var result = ""
        let mask = ["(", "X", "X", ")", " ", "X", "X", "X", "X", "X", "-", "X", "X", "X", "X"]
        var index = digits.startIndex
        for symbol in mask {
            guard index < digits.endIndex else { break }
            if symbol == "X" {
                result.append(digits[index])
                index = digits.index(after: index)
            } else {
                result.append(symbol)
            }
        }
        return result
    }
}
