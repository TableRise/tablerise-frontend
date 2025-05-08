// types/campaign.ts
export interface Campaign {
  id: string;
  title: string;
  description: string;
  color: string;
  date: string;
  status: string;
  participants: Participant[];
}

  export interface Participant {
    id: string;
    characterName: string;
    playerName: string;
    color: string;
  }
  
