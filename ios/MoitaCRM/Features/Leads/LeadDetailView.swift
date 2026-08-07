import SwiftUI

struct LeadDetailView: View {
    @State var lead: Lead
    @State private var selectedTab = 0

    var body: some View {
        VStack {
            Picker("Seções", selection: $selectedTab) {
                Text("Dados").tag(0)
                Text("Atividades").tag(1)
                Text("Campos").tag(2)
                Text("Notas").tag(3)
                Text("Arquivos").tag(4)
            }
            .pickerStyle(.segmented)
            .padding()

            TabView(selection: $selectedTab) {
                LeadInfoView(lead: lead)
                    .tag(0)
                LeadActivitiesView(activities: lead.activities)
                    .tag(1)
                CustomFieldsDetailView(entityId: lead.id, scope: .lead)
                    .tag(2)
                NotesPlaceholderView()
                    .tag(3)
                FilesPlaceholderView()
                    .tag(4)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
        }
        .navigationTitle(lead.name)
    }
}

struct LeadInfoView: View {
    let lead: Lead

    var body: some View {
        Form {
            Section("Contato") {
                LabeledContent("Empresa", value: lead.company)
                LabeledContent("E-mail", value: lead.email)
                LabeledContent("Telefone", value: lead.phone)
                LabeledContent("Origem", value: lead.source)
            }
            Section("Status") {
                LabeledContent("Status", value: lead.status)
                LabeledContent("Score", value: "\(lead.score)")
                Toggle("Consentimento LGPD", isOn: .constant(lead.consentToContact))
                    .disabled(true)
            }
        }
    }
}

struct LeadActivitiesView: View {
    let activities: [Activity]

    var body: some View {
        List(activities) { activity in
            VStack(alignment: .leading) {
                Text(activity.title).font(.headline)
                Text(activity.type.localizedName).font(.subheadline)
                Text(activity.dueAt, style: .date)
            }
        }
    }
}

struct NotesPlaceholderView: View {
    var body: some View {
        ContentUnavailableView("Notas", systemImage: "square.and.pencil", description: Text("Em breve"))
    }
}

struct FilesPlaceholderView: View {
    var body: some View {
        ContentUnavailableView("Arquivos", systemImage: "folder", description: Text("Integração futura"))
    }
}
