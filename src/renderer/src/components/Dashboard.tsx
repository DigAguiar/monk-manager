import { useMemo, useState } from 'react';
import { Monk } from '../types/monk.type';

interface DashboardProps {
  monks: Monk[];
}

// Cores para o gráfico de pizza
const PIE_COLORS = [
  '#3b82f6', // Azul
  '#ef4444', // Vermelho
  '#10b981', // Verde
  '#f59e0b', // Amarelo
  '#8b5cf6', // Roxo
  '#ec4899', // Rosa
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#94a3b8'  // Cinza (outros)
];

// --- SUB-COMPONENTES ---

const StatCard = ({ label, value }: { label: string, value: string | number }) => (
  <div className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-lg shadow border border-gray-200">
    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
    <p className="text-3xl font-bold text-blue-900 mt-1">{value}</p>
  </div>
);

const BarChart = ({ data, title, colorClass }: { data: {label: string, value: number}[], title: string, colorClass: string }) => {
  const maxVal = Math.max(...data.map(d => d.value)) || 1;
  
  return (
    <div className="bg-white p-5 rounded-lg shadow border border-gray-100 h-full">
      <h3 className="text-gray-600 font-bold uppercase text-xs mb-4">{title}</h3>
      <div className="space-y-3">
        {data.slice(0, 6).map((item) => (
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

const PieChart = ({ data }: { data: {label: string, value: number}[] }) => {
  if (data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-400 italic">Sem dados suficientes</div>;

  // Calcula o total para porcentagens
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  
  // Cria o gradiente cônico CSS
  let currentAngle = 0;
  const gradientParts = data.slice(0, 8).map((item, index) => {
    const percentage = (item.value / total) * 100;
    const color = PIE_COLORS[index % PIE_COLORS.length];
    const start = currentAngle;
    const end = currentAngle + percentage;
    currentAngle = end;
    return `${color} ${start}% ${end}%`;
  });

  // Se sobrou algo (tail), pinta de cinza
  if (currentAngle < 100) {
    gradientParts.push(`#e2e8f0 ${currentAngle}% 100%`);
  }

  const gradientString = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
      {/* O Círculo */}
      <div 
        className="w-48 h-48 rounded-full shadow-inner relative"
        style={{ background: gradientString }}
      >
        {/* Buraco no meio para fazer virar "Donut" (Opcional, deixa mais bonito) */}
        <div className="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
           <span className="text-gray-400 text-xs font-bold">TOTAL: {total}</span>
        </div>
      </div>

      {/* A Legenda */}
      <div className="flex-1 space-y-2 min-w-[200px]">
        {data.slice(0, 8).map((item, index) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
              ></div>
              <span className="text-gray-700 truncate max-w-[120px]" title={item.label}>{item.label}</span>
            </div>
            <span className="font-bold text-gray-900">{Math.round((item.value/total)*100)}% ({item.value})</span>
          </div>
        ))}
        {data.length > 8 && (
          <div className="text-xs text-gray-400 text-right mt-2">+ {data.length - 8} outros</div>
        )}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export function Dashboard({ monks }: DashboardProps) {
  
  // Estado para controlar qual gráfico o cliente quer ver
  const [selectedPieMetric, setSelectedPieMetric] = useState<keyof Monk>('ocupacao_oficio');

  // Lógica Avançada de Contagem (Suporta Texto E Arrays)
  const getStats = (key: keyof Monk) => {
    const counts: Record<string, number> = {};
    
    monks.forEach(m => {
      const rawVal = m[key];

      if (Array.isArray(rawVal)) {
        // Se for lista (ex: ocupações), conta cada item individualmente
        if (rawVal.length === 0) {
           counts['Não informado'] = (counts['Não informado'] || 0) + 1;
        } else {
           rawVal.forEach(v => {
             counts[v] = (counts[v] || 0) + 1;
           });
        }
      } else {
        // Se for texto normal
        const val = rawVal ? String(rawVal) : 'Não informado';
        counts[val] = (counts[val] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Dados calculados
  const statsPie = useMemo(() => getStats(selectedPieMetric), [monks, selectedPieMetric]);
  const statsPais = useMemo(() => getStats('pais_nascimento'), [monks]);
  const statsCidade = useMemo(() => getStats('cidade_nascimento'), [monks]);
  const statsDoenca = useMemo(() => getStats('doencas'), [monks]);
  const statsOcupacao = useMemo(() => getStats('ocupacao_oficio'), [monks]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* 1. Resumo Numérico */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Registros" value={monks.length} />
        <StatCard label="Países" value={statsPais.length} />
        <StatCard label="Cidades" value={statsCidade.length} />
        <StatCard label="Ocupações" value={statsOcupacao.length} />
      </div>

      {/* 2. Área do Gráfico Dinâmico (Cliente escolhe) */}
      <div className="bg-white p-6 rounded-lg shadow border border-blue-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            📊 Análise Visual
          </h2>
          
          {/* O Seletor Mágico */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Visualizar por:</span>
            <select 
              className="p-2 border rounded bg-gray-50 text-sm font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              value={selectedPieMetric}
              // @ts-ignore
              onChange={(e) => setSelectedPieMetric(e.target.value)}
            >
              <option value="ocupacao_oficio">Ocupação / Ofício</option>
              <option value="pais_nascimento">País de Nascimento</option>
              <option value="cidade_nascimento">Cidade de Nascimento</option>
              <option value="doencas">Causa Mortis / Doenças</option>
              <option value="local_profissao_religiosa">Local Profissão Religiosa</option>
            </select>
          </div>
        </div>

        <PieChart data={statsPie} />
      </div>

      {/* 3. Gráficos de Barra Fixos (Resumo Rápido) */}
      <h3 className="text-gray-500 font-bold uppercase text-xs mt-8 mb-2 pl-1">Outras Métricas</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BarChart data={statsPais} title="Top Países" colorClass="bg-blue-500" />
        <BarChart data={statsCidade} title="Top Cidades" colorClass="bg-green-500" />
        <BarChart data={statsDoenca} title="Causa Mortis / Doenças" colorClass="bg-red-500" />
      </div>

      <div className="text-center text-gray-400 text-xs mt-4">
        * Os dados acima reagem aos filtros da lista principal.
      </div>
    </div>
  );
}