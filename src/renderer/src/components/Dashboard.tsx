import { useMemo } from 'react';
import { Monk } from '../types/monk.type';

interface DashboardProps {
  monks: Monk[];
}

// --- SUB-COMPONENTES (Movidos para fora para performance) ---

const StatCard = ({ label, value }: { label: string, value: string | number }) => (
  <div className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-lg shadow border border-gray-200">
    <p className="text-gray-500 text-xs font-bold uppercase">{label}</p>
    <p className="text-3xl font-bold text-blue-900 mt-1">{value}</p>
  </div>
);

const BarChart = ({ data, title, colorClass }: { data: {label: string, value: number}[], title: string, colorClass: string }) => {
  const maxVal = Math.max(...data.map(d => d.value)) || 1; // Evita divisão por zero
  
  return (
    <div className="bg-white p-5 rounded-lg shadow border border-gray-100">
      <h3 className="text-gray-600 font-bold uppercase text-xs mb-4">{title}</h3>
      <div className="space-y-3">
        {data.slice(0, 8).map((item) => ( // Mostra top 8
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700 truncate w-3/4" title={item.label}>{item.label}</span>
              <span className="font-bold text-gray-900">{item.value}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${colorClass}`} 
                style={{ width: `${(item.value / maxVal) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-gray-400 italic text-sm">Sem dados para exibir</p>}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export function Dashboard({ monks }: DashboardProps) {
  
  // Função de contagem corrigida
  const getStats = (key: keyof Monk) => {
    const counts: Record<string, number> = {};
    
    monks.forEach(m => {
      // CORREÇÃO AQUI:
      // Usamos 'String()' para garantir que seja texto, mesmo se vier null ou array.
      // Isso acalma o TypeScript e previne erros.
      const rawVal = m[key];
      const val = rawVal ? String(rawVal) : 'Não informado';
      
      counts[val] = (counts[val] || 0) + 1;
    });
    
    // Transforma em array e ordena do maior para o menor
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Cálculos otimizados com useMemo
  const statsPais = useMemo(() => getStats('pais_nascimento'), [monks]);
  const statsCidade = useMemo(() => getStats('cidade_nascimento'), [monks]);
  const statsTitulo = useMemo(() => getStats('titulo'), [monks]);
  const statsDoenca = useMemo(() => getStats('doencas'), [monks]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Resumo Numérico */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Filtrado" value={monks.length} />
        <StatCard label="Países Diferentes" value={statsPais.length} />
        <StatCard label="Cidades Diferentes" value={statsCidade.length} />
        <StatCard label="Títulos Diferentes" value={statsTitulo.length} />
      </div>

      {/* 2. Gráficos de Barra */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BarChart data={statsPais} title="Por País de Nascimento" colorClass="bg-blue-500" />
        <BarChart data={statsCidade} title="Por Cidade de Nascimento" colorClass="bg-green-500" />
        <BarChart data={statsTitulo} title="Por Título Religioso" colorClass="bg-purple-500" />
        <BarChart data={statsDoenca} title="Causa Mortis / Doenças" colorClass="bg-red-500" />
      </div>

      <div className="text-center text-gray-400 text-xs mt-4">
        * Os gráficos reagem automaticamente aos Filtros Avançados acima.
      </div>
    </div>
  );
}