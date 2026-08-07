import SwiftUI
import Charts

struct ReportsDashboardView: View {
    @StateObject private var viewModel = ReportsViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Text("Conversão por estágio")
                    .font(.title2)
                Chart(viewModel.stageConversion) { data in
                    BarMark(x: .value("Estágio", data.stage), y: .value("%", data.percentage))
                }
                .frame(height: 200)

                Text("Tempo médio por estágio")
                    .font(.title2)
                Chart(viewModel.stageDurations) { data in
                    LineMark(x: .value("Estágio", data.stage), y: .value("Dias", data.days))
                }
                .frame(height: 200)

                Text("Conversão por origem")
                    .font(.title2)
                Chart(viewModel.sourceConversion) { data in
                    SectorMark(angle: .value("%", data.percentage), innerRadius: .ratio(0.5))
                        .foregroundStyle(by: .value("Origem", data.source))
                }
                .frame(height: 200)

                Text("Heatmap de atividades")
                    .font(.title2)
                HeatmapView(heatmap: viewModel.activityHeatmap)
                    .frame(height: 240)
            }
            .padding()
        }
        .onAppear { viewModel.load() }
        .navigationTitle("Relatórios")
    }
}

struct HeatmapView: View {
    let heatmap: [ReportsViewModel.HeatmapPoint]

    var body: some View {
        GeometryReader { proxy in
            let hours = Array(0..<24)
            let days = Calendar.current.shortWeekdaySymbols
            let cellWidth = proxy.size.width / CGFloat(days.count)
            let cellHeight = proxy.size.height / CGFloat(hours.count)
            ZStack {
                ForEach(days.indices, id: \.self) { dayIndex in
                    ForEach(hours, id: \.self) { hour in
                        let value = heatmap.first(where: { $0.dayIndex == dayIndex && $0.hour == hour })?.count ?? 0
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.blue.opacity(Double(value) / 10.0))
                            .frame(width: cellWidth - 4, height: cellHeight - 4)
                            .position(x: CGFloat(dayIndex) * cellWidth + cellWidth / 2,
                                      y: CGFloat(hour) * cellHeight + cellHeight / 2)
                            .accessibilityLabel("\(days[dayIndex]) às \(hour)h: \(value) atividades")
                    }
                }
            }
        }
    }
}
