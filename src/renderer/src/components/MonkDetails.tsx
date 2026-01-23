import { Monk } from '../types/monk.type';

interface MonkDetailsProps {
  monk: Monk;
  onClose: () => void;
  onEdit: (monk: Monk) => void;
}

export function MonkDetails({ monk, onClose, onEdit }: MonkDetailsProps) {
  
  // Helper para mostrar "Não informado" se estiver vazio/null
  const val = (value: any) => value ? value : <span className="text-gray-400 italic">Não informado</span>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl flex flex-col">
        
        {/* CABEÇALHO DA FICHA */}
        <div className="bg-amber-50 p-6 border-b border-amber-200 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-800">{monk.nome}</h2>
            <p className="text-amber-800 font-medium text-lg mt-1">{monk.titulo || 'Sem título registrado'}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>

        {/* CORPO DA FICHA (Tudo em uma página só) */}
        <div className="p-8 space-y-8 font-serif">
          
          {/* BLOCO 1: DADOS PESSOAIS */}
          <section>
            <h3 className="text-lg font-bold text-gray-700 border-b pb-1 mb-3 uppercase tracking-wider">Origem & Vida Civil</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <span className="block text-sm text-gray-500 font-sans">Nascimento</span>
                <p className="text-lg">{val(monk.data_nascimento)} {monk.local_nascimento && `em ${monk.local_nascimento}`}</p>
              </div>
              <div>
                <span className="block text-sm text-gray-500 font-sans">Batismo</span>
                <p className="text-lg">{val(monk.data_batismo)} {monk.local_batismo && `em ${monk.local_batismo}`}</p>
              </div>
              <div className="col-span-2">
                <span className="block text-sm text-gray-500 font-sans">Filiação</span>
                <p className="text-lg">Filho de <strong>{val(monk.nome_pai)}</strong> e <strong>{val(monk.nome_mae)}</strong></p>
              </div>
            </div>
          </section>

          {/* BLOCO 2: VIDA MONÁSTICA */}
          <section>
            <h3 className="text-lg font-bold text-gray-700 border-b pb-1 mb-3 uppercase tracking-wider">Trajetória Monástica</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <span className="block text-sm text-gray-500 font-sans">Ingresso no Mosteiro</span>
                <p>{val(monk.data_ingresso_mosteiro)}</p>
              </div>
              <div>
                <span className="block text-sm text-gray-500 font-sans">Profissão Religiosa</span>
                <p>{val(monk.data_profissao_religiosa)} {monk.local_profissao_religiosa && `(${monk.local_profissao_religiosa})`}</p>
              </div>
              <div className="col-span-2">
                 <span className="block text-sm text-gray-500 font-sans">Formação</span>
                 <p className="whitespace-pre-wrap">{val(monk.formacao)}</p>
              </div>
              <div className="col-span-2">
                 <span className="block text-sm text-gray-500 font-sans">Ocupações e Ofícios</span>
                 <p>{val(monk.ocupacao_oficio)}</p>
              </div>
               <div className="col-span-2">
                 <span className="block text-sm text-gray-500 font-sans">Matéria Ensinada</span>
                 <p>{val(monk.materia_ensinada)}</p>
              </div>
            </div>
          </section>

          {/* BLOCO 3: LEGADO E FINAL */}
          <section>
            <h3 className="text-lg font-bold text-gray-700 border-b pb-1 mb-3 uppercase tracking-wider">Legado & Falecimento</h3>
            
            <div className="mb-4">
               <span className="block text-sm text-gray-500 font-sans mb-1">Livros Relacionados</span>
               {monk.livros && monk.livros.length > 0 ? (
                 <ul className="list-disc list-inside space-y-1">
                   {monk.livros.map((livro, idx) => <li key={idx} className="text-gray-800">{livro}</li>)}
                 </ul>
               ) : (
                 <span className="text-gray-400 italic">Nenhum livro registrado</span>
               )}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <span className="block text-sm text-gray-500 font-sans">Falecimento</span>
                  <p className="font-bold text-red-900">{val(monk.data_falecimento)}</p>
               </div>
               <div>
                  <span className="block text-sm text-gray-500 font-sans">Causa / Doenças</span>
                  <p>{val(monk.doencas)}</p>
               </div>
            </div>
          </section>

          {/* RODAPÉ: REFERÊNCIAS */}
          <div className="bg-gray-50 p-4 rounded text-sm text-gray-600">
            <p><strong>Ref. Manuscrito:</strong> {val(monk.referencia_manuscrito)}</p>
            <p><strong>Ref. Edição:</strong> {val(monk.referencia_edicao)}</p>
          </div>

        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="p-4 bg-gray-100 border-t flex justify-end gap-3 sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">Fechar</button>
          <button 
            onClick={() => onEdit(monk)} 
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold shadow-lg"
          >
            Editar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}