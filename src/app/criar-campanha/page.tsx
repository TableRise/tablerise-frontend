export default function CriarCampanhaPage() {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Criar Nova Campanha</h1>
        
        <form className="space-y-4">
          <div>
            <label className="block mb-1">Título</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded"
              placeholder="Nome da campanha"
            />
          </div>
          
          <div>
            <label className="block mb-1">Cor</label>
            <input 
              type="color" 
              className="w-16 h-10"
              defaultValue="#4F46E5"
            />
          </div>
          
          <div>
            <label className="block mb-1">Data</label>
            <input 
              type="date" 
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-1">Descrição</label>
            <textarea 
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Descreva sua campanha"
            />
          </div>
          
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Criar Campanha
          </button>
        </form>
      </div>
    );
  }