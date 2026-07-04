export type CandidateContext = {
  leadId: string;
  nome: string;
  empresa: string | null;
  email: string | null;
  telefone: string | null;
  instagram: string | null;
  score: number;
  status: string;
  motivoFlag: string[];
  ultimaProspeccaoEm: string | null;
  deal: { dealId: string; pipelineNome: string; stageNome: string; valorPrevistoBRL: number } | null;
  notasRecentes: { content: string; createdAt: string }[];
  atividadesRecentes: {
    tipo: string;
    titulo: string;
    descricao: string | null;
    doneAt: string | null;
    dueAt: string | null;
  }[];
  planosDisponiveis: { nome: string; precoBRL: number; descricao: string | null }[];
  conversaAberta: boolean;
};
