import '@/app/campaigns/lobby/page.css';
import '@/components/lobby/styles/LobbySideMenu.css';

export default function CampaignLobbyLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>): React.ReactNode {
    return children;
}
