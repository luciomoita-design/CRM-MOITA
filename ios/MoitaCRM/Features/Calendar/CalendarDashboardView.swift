import SwiftUI

struct CalendarDashboardView: View {
    @StateObject private var viewModel = CalendarViewModel()
    @State private var displayMode: CalendarViewModel.DisplayMode = .month

    var body: some View {
        VStack {
            Picker("Visão", selection: $displayMode) {
                ForEach(CalendarViewModel.DisplayMode.allCases, id: \.self) { mode in
                    Text(mode.title).tag(mode)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal)
            .onChange(of: displayMode) { _, newValue in
                viewModel.displayMode = newValue
            }

            CalendarGridView(events: viewModel.events, mode: viewModel.displayMode)
                .padding()
        }
        .navigationTitle("Calendário")
        .toolbar {
            Button(action: { viewModel.showCreate = true }) {
                Image(systemName: "plus")
            }
        }
        .sheet(isPresented: $viewModel.showCreate) {
            CalendarEventForm { event in
                viewModel.create(event: event)
            }
        }
        .onAppear { viewModel.load() }
    }
}

struct CalendarGridView: View {
    let events: [CalendarEvent]
    let mode: CalendarViewModel.DisplayMode

    var body: some View {
        List(events) { event in
            VStack(alignment: .leading) {
                Text(event.title)
                    .font(.headline)
                Text("Início: \(event.startAt.formatted())")
                    .font(.caption)
                if let leadId = event.relatedLeadId {
                    Text("Lead: \(leadId.uuidString.prefix(6))…")
                        .font(.caption2)
                }
            }
        }
    }
}

struct CalendarEventForm: View {
    var onSave: (CalendarEvent) -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var notes = ""
    @State private var allDay = false
    @State private var startAt = Date()
    @State private var endAt = Date().addingTimeInterval(3600)

    var body: some View {
        NavigationStack {
            Form {
                TextField("Título", text: $title)
                TextField("Notas", text: $notes)
                Toggle("Dia todo", isOn: $allDay)
                DatePicker("Início", selection: $startAt)
                DatePicker("Fim", selection: $endAt)
            }
            .navigationTitle("Novo evento")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salvar") {
                        let event = CalendarEvent(title: title,
                                                   notes: notes,
                                                   startAt: startAt,
                                                   endAt: endAt,
                                                   allDay: allDay,
                                                   ownerId: UUID())
                        onSave(event)
                        dismiss()
                    }
                    .disabled(title.isEmpty)
                }
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar", action: dismiss.callAsFunction)
                }
            }
        }
    }
}
