import { useEffect, useState, useMemo } from 'react';
import { Monk } from './types/monk.type'; 
import { MonkForm } from './components/MonkForm';
import { MonkDetails } from './components/MonkDetails';
import { SearchableSelect } from './components/SearchableSelect';
import { Dashboard } from './components/Dashboard';
import { Pagination } from './components/Pagination'; // <--- Novo Componente

// Importações Refatoradas
import { PREDEFINED_OCCUPATIONS, FILTER_GROUPS } from './constants/data';
import { maskDate } from './utils/formatters';

const ITEMS_PER_PAGE = 10;

function App() {
  const [monks, setMonks] = useState<Monk[]>([]);
  const [view, setView] = useState<'list' | 'form' | 'dashboard'>('list');
  const [editingMonk, setEditingMonk] = useState<Monk | undefined>(undefined);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [viewingMonk, setViewingMonk] = useState<Monk | null>(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMonks = async () => {
    const data = await window.api.getAllMonks();
    setMonks(data);
  };

  useEffect(() => {
    fetchMonks();
  }, []);

  // Resetar para a página 1 sempre que filtrar ou buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilters]);

  const handleBackup = async () => {
    // @ts-ignore
    const success = await window.api.backupDB();
    if (success) alert('Backup salvo com sucesso! Guarde este arquivo em segurança.');
  };

  const handleRestore = async () => {
    if (confirm('⚠️ ATENÇÃO: Restaurar um backup vai substituir TODOS os dados atuais pelos do arquivo.\n\nTem certeza que deseja continuar?')) {
      // @ts-ignore
      const success = await window.api.restoreDB();
      if (!success) alert('A restauração foi cancelada ou falhou.');
    }
  };

  const allOccupations = useMemo(() => {
    const set = new Set<string>(PREDEFINED_OCCUPATIONS); 
    monks.forEach(m => {
      if (Array.isArray(m.ocupacao_oficio)) {
        m.ocupacao_oficio.forEach(o => set.add(o));
      }
    });
    return Array.from(set).sort();
  }, [monks]);

  const getUniqueOptions = (key: keyof Monk) => {
    if (key === 'ocupacao_oficio') return allOccupations;

    const values = monks.map(m => m[key]).filter(v => v !== null && v !== "" && !Array.isArray(v));
    // @ts-ignore
    return Array.from(new Set(values)).sort();
  };

  // 1. Aplica Filtros
  const filteredMonks = useMemo(() => {
    return monks.filter(m => {
      const matchesSearch = 
        searchTerm === '' ||
        m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.cidade_nascimento && m.cidade_nascimento.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilters = Object.entries(activeFilters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        if (key === 'ocupacao_oficio') {
           return m.ocupacao_oficio && m.ocupacao_oficio.includes(filterValue);
        }
        // @ts-ignore
        const dbValue = m[key];
        if (!dbValue) return false;
        return String(dbValue).toLowerCase().includes(filterValue.toLowerCase());
      });

      return matchesSearch && matchesFilters;
    });
  }, [monks, searchTerm, activeFilters]);

  // 2. Aplica Paginação
  const paginatedMonks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredMonks.slice(startIndex, endIndex);
  }, [filteredMonks, currentPage]);

  const totalPages = Math.ceil(filteredMonks.length / ITEMS_PER_PAGE);

  // Actions
  const handleSave = async (data: Monk) => {
    if (editingMonk && editingMonk.id) {
      await window.api.updateMonk({ ...data, id: editingMonk.id });
    } else {
      await window.api.createMonk(data);
    }
    await fetchMonks();
    setView('list');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza?')) {
      await window.api.deleteMonk(id);
      await fetchMonks();
    }
  };

  const startEdit = (monk: Monk) => { setEditingMonk(monk); setView('form'); };
  const startCreate = () => { setEditingMonk(undefined); setView('form'); };

  const handleExportCSV = () => {
    if (monks.length === 0) return alert('Nada para exportar.');
    const ignoreFields = ['id', 'created_at'];
    const firstMonk = monks[0] as any;
    const keys = Object.keys(firstMonk).filter(key => !ignoreFields.includes(key));
    const headers = keys.join(';');
    const rows = monks.map((monk: any) => {
      return keys.map(key => {
        const value = monk[key];
        if (Array.isArray(value)) return `"${value.join(', ')}"`;
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        return value === null ? '' : value;
      }).join(';');
    }).join('\n');
    const csvContent = "sep=;\n" + headers + '\n' + rows; 
    const finalContent = "\uFEFF" + csvContent;
    const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `monges_dados_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateFilter = (key: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  if (view === 'form') {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <MonkForm 
          initialData={editingMonk} 
          onSubmit={handleSave} 
          onCancel={() => setView('list')}
          existingOccupations={allOccupations}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dietário Volume 1</h1>
            <p className="text-gray-500">Mostrando {filteredMonks.length} registros (Total)</p>
          </div>
          <div className="flex gap-2 items-center">
            
            <div className="flex gap-2 mr-4 border-r pr-4">
              <button 
                onClick={handleBackup}
                className="text-gray-600 hover:text-blue-600 p-2 rounded border border-gray-200 hover:bg-gray-50 text-xs font-bold flex flex-col items-center shadow-sm transition-colors"
                title="Salvar cópia de segurança"
              >
                💾 Backup
              </button>
              <button 
                onClick={handleRestore}
                className="text-gray-600 hover:text-red-600 p-2 rounded border border-gray-200 hover:bg-gray-50 text-xs font-bold flex flex-col items-center shadow-sm transition-colors"
                title="Restaurar dados de um arquivo"
              >
                ♻️ Restaurar
              </button>
            </div>

            <div className="bg-white p-1 rounded border shadow-sm flex mr-2">
               <button 
                 onClick={() => setView('list')}
                 className={`px-4 py-1.5 rounded text-sm font-bold transition-colors ${view === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
               >
                 📂 Lista
               </button>
               <button 
                 onClick={() => setView('dashboard')}
                 className={`px-4 py-1.5 rounded text-sm font-bold transition-colors ${view === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
               >
                 📊 Gráficos
               </button>
            </div>

            <button 
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-bold flex items-center gap-2 mr-2"
            >
              📊 Exportar
            </button>

            <button onClick={startCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow font-bold">+ Novo</button>
          </div>
        </div>

        {/* ÁREA DE FILTROS */}
        <div className="mb-6 bg-white p-4 rounded shadow border border-gray-100">
             <div className="flex gap-4 mb-2">
                <input 
                    type="text" 
                    placeholder="Pesquisa rápida..." 
                    className="flex-1 p-3 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 rounded font-medium ${showFilters ? 'bg-gray-200 text-gray-800' : 'bg-blue-50 text-blue-600 border'}`}
                >
                    {showFilters ? 'Ocultar Filtros' : 'Filtros Avançados ▼'}
                </button>
            </div>
            {showFilters && (
                <div className="mt-6 pt-2 animate-fade-in space-y-8">
                    {FILTER_GROUPS.map((group) => (
                      <div key={group.title} className="relative">
                        <div className="absolute -top-3 left-3 px-2 bg-white text-sm font-bold text-blue-600 uppercase tracking-wider">{group.title}</div>
                        <div className="border rounded-lg p-5 pt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-gray-50/50">
                          {group.fields.map((field) => (
                            <div key={field.key}>
                              {field.type === 'select' ? (
                                <SearchableSelect 
                                  label={field.label}
                                  // @ts-ignore
                                  options={getUniqueOptions(field.key)}
                                  value={activeFilters[field.key] || ''}
                                  onChange={(val) => updateFilter(field.key, val)}
                                />
                              ) : (
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{field.label}</label>
                                  <input 
                                    type="text"
                                    placeholder={field.placeholder}
                                    className="w-full p-2 text-sm border rounded bg-white"
                                    value={activeFilters[field.key] || ''}
                                    onChange={(e) => updateFilter(field.key, field.type === 'date' ? maskDate(e.target.value) : e.target.value)}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end pt-2">
                       <button onClick={() => setActiveFilters({})} className="text-red-600 text-sm hover:underline py-2 px-4 border border-red-200 rounded hover:bg-red-50 bg-white">Limpar Filtros ✕</button>
                    </div>
                </div>
            )}
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        {view === 'dashboard' ? (
           <Dashboard monks={filteredMonks} />
        ) : (
           <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col min-h-[500px]">
              
              {/* TABELA */}
              <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome / Ocupação</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origem</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profissão</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedMonks.map((monk) => (
                      <tr key={monk.id} onClick={() => setViewingMonk(monk)} className="hover:bg-blue-50 transition-colors cursor-pointer">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">{monk.nome}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {monk.ocupacao_oficio && monk.ocupacao_oficio.length > 0 
                              ? monk.ocupacao_oficio.join(', ') 
                              : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {monk.cidade_nascimento} - {monk.pais_nascimento} <br/>
                          <span className="text-xs text-gray-400">{monk.data_nascimento}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{monk.data_profissao_religiosa}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button onClick={(e) => { e.stopPropagation(); startEdit(monk); }} className="text-blue-600 mr-4">Editar</button>
                          <button onClick={(e) => { e.stopPropagation(); monk.id && handleDelete(monk.id); }} className="text-red-600">Excluir</button>
                        </td>
                      </tr>
                    ))}
                    {paginatedMonks.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">Nenhum registro encontrado.</td></tr>}
                  </tbody>
                </table>
              </div>

              {/* PAGINAÇÃO NOVA */}
              {filteredMonks.length > 0 && (
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={setCurrentPage} 
                />
              )}
           </div>
        )}

        {viewingMonk && <MonkDetails monk={viewingMonk} onClose={() => setViewingMonk(null)} onEdit={(m) => { setViewingMonk(null); startEdit(m); }} />}
      </div>
    </div>
  );
}

export default App;