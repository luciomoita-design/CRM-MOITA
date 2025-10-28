import XCTest

final class MoitaCRMUITests: XCTestCase {
    func testLoginAndCreateLeadFlow() {
        let app = XCUIApplication()
        app.launch()

        let emailField = app.textFields["E-mail"]
        if emailField.exists {
            emailField.tap()
            emailField.typeText("user@moita.app")
            app.secureTextFields.firstMatch.tap()
            app.secureTextFields.firstMatch.typeText("password")
            app.buttons["Entrar"].tap()
        }

        app.tabBars.buttons["Leads"].tap()
        app.navigationBars.buttons["line.3.horizontal.decrease.circle"].tap()
    }
}
