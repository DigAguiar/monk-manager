import { useMemo, useState, useRef } from 'react';
import { Monk } from '../types/monk.type';
import html2canvas from 'html2canvas';

interface DashboardProps {
  monks: Monk[];
}

// Cores vibrantes para o Top 8
const COLORS = [
  '#3b82f6', // Azul
  '#ef4444', // Vermelho
  '#10b981', // Verde
  '#f59e0b', // Amarelo
  '#8b5cf6', // Roxo
  '#ec4899', // Rosa
  '#06b6d4', // Ciano
  '#f97316'  // Laranja
];
const COLOR_OTHER = '#64748b'; // Cinza para "Outros"

// --- HELPERS ---

const calculateAverageAge = (monks: Monk[]) => {
  let totalAge = 0;
  let count = 0;

  monks.forEach(m => {
    if (m.data_nascimento && m.data_falecimento && m.data_nascimento.length === 10 && m.data_falecimento.length === 10) {
      const yearBirth = parseInt(m.data_nascimento.split('/')[2]);
      const yearDeath = parseInt(m.data_falecimento.split('/')[2]);
      
      if (!isNaN(yearBirth) && !isNaN(yearDeath) && yearDeath > yearBirth) {
        totalAge += (yearDeath - yearBirth);
        count++;
      }
    }
  });

  return count > 0 ? Math.round(totalAge / count) + ' anos' : 'N/A';
};

// --- SUB-COMPONENTES ---

const StatCard = ({ label, value, subtext }: { label: string, value: string | number, subtext?: string }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between h-24">
    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  </div>
);

const BarChart = ({ data, colorClass }: { data: {label: string, value: number}[], colorClass: string }) => {
  const maxVal = Math.max(...data.map(d => d.value)) || 1;
  
  return (
    <div className="space-y-3 mt-4">
      {data.slice(0, 8).map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-gray-700 truncate w-3/4" title={item.label}>{item.label}</span>
            <span className="font-bold text-gray-900">{item.value}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${colorClass}`} 
              style={{ width: `${(item.value / maxVal) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
      {data.length === 0 && <p className="text-gray-400 italic text-sm">Sem dados para exibir</p>}
    </div>
  );
};

const PieChart = ({ data }: { data: {label: string, value: number}[] }) => {
  if (data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-400 italic">Sem dados suficientes</div>;

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  // Lógica de Agrupamento "Outros"
  // Se tiver mais de 9 itens, pegamos os 8 primeiros e somamos o resto em "Outros"
  const chartData = useMemo(() => {
    if (data.length <= 9) return data;
    
    const top8 = data.slice(0, 8);
    const rest = data.slice(8);
    const restValue = rest.reduce((acc, curr) => acc + curr.value, 0);
    
    return [
      ...top8,
      { label: 'Outros / Diversos', value: restValue, isOther: true }
    ];
  }, [data]);
  
  // Gera o Gradiente Cônico
  let currentAngle = 0;
  const gradientParts = chartData.map((item, index) => {
    const percentage = (item.value / total) * 100;
    // @ts-ignore
    const color = item.isOther ? COLOR_OTHER : COLORS[index % COLORS.length];
    
    const start = currentAngle;
    const end = currentAngle + percentage;
    currentAngle = end;
    return `${color} ${start}% ${end}%`;
  });

  return (
    <div className="flex flex-col items-center justify-center py-6">
      {/* O Gráfico */}
      <div 
        className="w-56 h-56 rounded-full shadow-inner relative"
        style={{ background: `conic-gradient(${gradientParts.join(', ')})` }}
      >
        <div className="absolute inset-0 m-auto w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-sm flex-col">
           <span className="text-2xl font-bold text-gray-700">{total}</span>
           <span className="text-[10px] text-gray-400 uppercase">Total</span>
        </div>
      </div>
      
      {/* Legenda Dinâmica (Com "Outros") */}
      <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-lg">
        {chartData.map((item, index) => {
           // @ts-ignore
           const color = item.isOther ? COLOR_OTHER : COLORS[index % COLORS.length];
           return (
            <div key={item.label} className="flex items-center gap-1.5 text-xs bg-gray-50 px-2 py-1 rounded border hover:bg-gray-100 transition-colors" title={item.label}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="font-medium text-gray-700 max-w-[120px] truncate">{item.label}</span>
              <span className="text-gray-400 border-l pl-1 ml-1 font-mono">{Math.round((item.value/total)*100)}%</span>
            </div>
           );
        })}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export function Dashboard({ monks }: DashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<keyof Monk>('ocupacao_oficio');
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (printRef.current) {
      try {
        const canvas = await html2canvas(printRef.current, { backgroundColor: '#ffffff', scale: 2 });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `grafico_acervo_${selectedMetric}_${new Date().toISOString().slice(0,10)}.png`;
        link.click();
      } catch (error) {
        console.error("Erro print:", error);
        alert("Erro ao salvar imagem.");
      }
    }
  };

  const getStats = (key: keyof Monk) => {
    const counts: Record<string, number> = {};
    monks.forEach(m => {
      const rawVal = m[key];
      if (Array.isArray(rawVal)) {
        if (rawVal.length === 0) counts['Não informado'] = (counts['Não informado'] || 0) + 1;
        else rawVal.forEach(v => counts[v] = (counts[v] || 0) + 1);
      } else {
        const val = rawVal ? String(rawVal) : 'Não informado';
        counts[val] = (counts[val] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  };

  const statsData = useMemo(() => getStats(selectedMetric), [monks, selectedMetric]);
  
  const averageAge = useMemo(() => calculateAverageAge(monks), [monks]);
  const topOccupation = useMemo(() => {
    const stats = getStats('ocupacao_oficio');
    return stats.length > 0 ? stats[0].label : '-';
  }, [monks]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. INDICADORES (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Filtrado" value={monks.length} subtext="Monges listados" />
        <StatCard label="Idade Média Est." value={averageAge} subtext="Baseado nas datas informadas" />
        <StatCard label="Ocupação Principal" value={topOccupation} subtext="Função mais comum no grupo" />
      </div>

      {/* 2. ÁREA DE GRÁFICO (Exportável) */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Barra de Ferramentas */}
        <div className="bg-gray-50 p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm font-bold text-gray-500 uppercase">Analisar por:</span>
            <select 
              className="flex-1 sm:flex-none p-2 border border-gray-300 rounded bg-white text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
              value={selectedMetric}
              // @ts-ignore
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              <option value="ocupacao_oficio">Ocupação / Ofício</option>
              <option value="doencas">Causa de Morte / Doenças</option>
              <option value="pais_nascimento">País de Nascimento</option>
              <option value="cidade_nascimento">Cidade de Nascimento</option>
              <option value="local_profissao_religiosa">Local Profissão Religiosa</option>
              <option value="local_batismo">Local de Batismo</option>
              <option value="materia_ensinada">Matéria Ensinada</option>
              <option value="nome_abade">Abade da Época</option>
            </select>
          </div>

          <button 
            onClick={handleDownloadImage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded shadow transition-colors"
          >
            📷 Baixar Gráfico
          </button>
        </div>

        {/* Área de Captura */}
        <div ref={printRef} className="p-8 bg-white grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 flex flex-col items-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center uppercase tracking-wide">
              Distribuição Proporcional
            </h3>
            <p className="text-sm text-gray-400 mb-6 text-center">Baseado em {monks.length} registros filtrados</p>
            <PieChart data={statsData} />
          </div>

          <div className="border-l pl-8 border-gray-100 flex flex-col justify-center">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Ranking (Top 8)</h3>
            <BarChart data={statsData} colorClass="bg-gray-600" />
            
            <div className="mt-8 p-4 bg-blue-50 rounded border border-blue-100 text-xs text-blue-800">
              <p><strong>Nota:</strong> O gráfico de pizza agrupa categorias menores em "Outros" para facilitar a leitura visual.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}