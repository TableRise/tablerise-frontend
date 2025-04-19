// types/campaign.ts
export interface Campaign {
    id: string;
    title: string;
    description: string;
    color: string;
    date: string;
    status: 'Agendado' | 'Em andamento' | 'Concluído';
  }