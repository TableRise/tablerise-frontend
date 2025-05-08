import { availableCampaigns } from '@/data/campaigns';

export default function EntrarCampanhaPage() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Entrar em Campanha</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-1">Código da Campanha</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded"
            placeholder="Digite o código de acesso"
          />
          <button className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
            Entrar com Código
          </button>
        </div>
        
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-3">Campanhas Disponíveis</h2>
          <div className="space-y-3">
            {availableCampaigns.map(campaign => (
              <div key={campaign.id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{campaign.title}</h3>
                  <p className="text-sm text-gray-500">{campaign.creator}</p>
                </div>
                <button className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded">
                  Entrar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}