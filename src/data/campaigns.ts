// data/campaigns.ts
import { Campaign } from '@/types/campaign';

export const campaignsData: Campaign[] = [
  {
    id: '1',
    title: 'Caçada Noturna',
    description: 'Uma aventura sob o luar',
    color: '#4F46E5',
    date: '15/10/2023',
    status: 'Agendado'
  },
  {
    id: '2',
    title: 'Tesouro Perdido',
    description: 'Encontre o tesouro dos antigos',
    color: '#10B981',
    date: '22/10/2023',
    status: 'Em andamento'
  }
];

export const participatingData: Campaign[] = [
  {
    id: '3',
    title: 'Masmorras do Rei',
    description: 'Desafie as profundezas',
    color: '#F59E0B',
    date: '05/11/2023',
    status: 'Agendado'
  }
];