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

// --- MAPA DE TÍTULOS (Para exibição bonita no gráfico) ---
const METRIC_TITLES: Record<string, string> = {
  'ocupacao_oficio': 'Ocupação / Ofício',
  'doencas': 'Causa de Morte / Doenças',
  'pais_nascimento': 'País de Nascimento',
  'cidade_nascimento': 'Cidade de Nascimento',
  'local_profissao_religiosa': 'Local da Profissão Religiosa',
  'local_batismo': 'Local de Batismo',
  'materia_ensinada': 'Matéria Ensinada',
  'nome_abade': 'Abade da Época'
};

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
  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between h-32">
    <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{label}</p>
    <div>
      <p className="text-4xl font-bold text-gray-800">{value}</p>
      {subtext && <p className="text-sm text-gray-400 mt-1">{subtext}</p>}
    </div>
  </div>
);

const BarChart = ({ data, colorClass }: { data: {label: string, value: number}[], colorClass: string }) => {
  const maxVal = Math.max(...data.map(d => d.value)) || 1;
  
  return (
    <div className="space-y-4 mt-6">
      {data.slice(0, 8).map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700 truncate w-3/4" title={item.label}>{item.label}</span>
            <span className="font-bold text-gray-900">{item.value}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${colorClass}`} 
              style={{ width: `${(item.value / maxVal) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
      {data.length === 0 && <p className="text-gray-400 italic text-sm">Sem dados para exibir</p>}
    </div>
  );
};

// --- PIE CHART SVG (Corrigido para rotação nativa) ---
const PieChart = ({ data }: { data: {label: string, value: number}[] }) => {
  if (data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-400 italic">Sem dados suficientes</div>;

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const chartData = useMemo(() => {
    if (data.length <= 9) return data;
    const top8 = data.slice(0, 8);
    const rest = data.slice(8);
    const restValue = rest.reduce((acc, curr) => acc + curr.value, 0);
    return [...top8, { label: 'Outros / Diversos', value: restValue, isOther: true }];
  }, [data]);

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  let cumulativePercent = 0;

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative w-80 h-80">
        
        {/* SVG com viewBox centralizado em 0,0 */}
        <svg viewBox="-1 -1 2 2" className="w-full h-full">
          {/* Grupo rotacionado -90 graus para começar do topo (meio-dia) */}
          <g transform="rotate(-90)">
            {chartData.map((slice, index) => {
              const startPercent = cumulativePercent;
              const slicePercent = slice.value / total;
              const endPercent = startPercent + slicePercent;
              cumulativePercent = endPercent;

              // @ts-ignore
              const color = slice.isOther ? COLOR_OTHER : COLORS[index % COLORS.length];

              // Círculo completo
              if (slicePercent >= 0.999) {
                return <circle key={index} cx="0" cy="0" r="1" fill={color} />;
              }

              const [startX, startY] = getCoordinatesForPercent(startPercent);
              const [endX, endY] = getCoordinatesForPercent(endPercent);
              const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

              const pathData = [
                `M 0 0`,
                `L ${startX} ${startY}`,
                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `L 0 0`,
              ].join(' ');

              return <path key={index} d={pathData} fill={color} stroke="white" strokeWidth="0.01" />;
            })}
          </g>
        </svg>

        <div className="absolute inset-0 m-auto w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-sm flex-col z-10">
           <span className="text-4xl font-bold text-gray-700">{total}</span>
           <span className="text-sm text-gray-400 uppercase font-bold mt-1">Total</span>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-2xl">
        {chartData.map((item, index) => {
           // @ts-ignore
           const color = item.isOther ? COLOR_OTHER : COLORS[index % COLORS.length];
           return (
            <div key={item.label} className="flex items-center gap-1.5 text-xs bg-gray-50 px-3 py-1.5 rounded border hover:bg-gray-100 transition-colors" title={item.label}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="font-medium text-gray-700 max-w-[140px] truncate text-sm">{item.label}</span>
              <span className="text-gray-900 font-bold border-l pl-2 ml-1 font-mono text-sm">{Math.round((item.value/total)*100)}%</span>
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

  // --- FUNÇÃO DE DOWNLOAD PROFISSIONAL (Usando onClone) ---
  const handleDownloadImage = async () => {
    if (printRef.current) {
      try {
        const canvas = await html2canvas(printRef.current, { 
          backgroundColor: '#ffffff', 
          scale: 2, // Alta resolução (Retina)
          logging: false,
          // onclone: Permite modificar a cópia do DOM antes de tirar a foto
          // Aqui a gente expande o padding sem afetar a tela do usuário
          onclone: (clonedDoc) => {
            const printArea = clonedDoc.getElementById('print-area-container');
            if (printArea) {
              printArea.style.padding = '40px'; // Adiciona respiro
              printArea.style.width = '1200px'; // Força uma largura boa para apresentação
              printArea.style.maxWidth = 'none'; // Remove limitações
            }
          }
        });

        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        // Nome do arquivo amigável e limpo
        const safeTitle = (METRIC_TITLES[selectedMetric] || selectedMetric)
          .replace(/\//g, '-')
          .replace(/\s+/g, '_');
        link.download = `Analise_${safeTitle}.png`;
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
              {Object.entries(METRIC_TITLES).map(([key, label]) => (
                 <option key={key} value={key}>{label}</option>
              ))}
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
        {/* Adicionamos o ID 'print-area-container' para o onclone achar */}
        <div ref={printRef} id="print-area-container" className="p-8 bg-white grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 flex flex-col items-center justify-center min-h-[400px]">
            {/* TÍTULO DINÂMICO USANDO O MAPA */}
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center uppercase tracking-wide">
              Distribuição por: {METRIC_TITLES[selectedMetric] || selectedMetric}
            </h3>
            <p className="text-sm text-gray-400 mb-6 text-center">Baseado em {monks.length} registros filtrados</p>
            <PieChart data={statsData} />
          </div>

          <div className="border-l pl-8 border-gray-100 flex flex-col justify-center">
            <h3 className="text-lg font-bold text-gray-500 uppercase mb-4">
              Top 8: {METRIC_TITLES[selectedMetric] || selectedMetric}
            </h3>
            <BarChart data={statsData} colorClass="bg-gray-600" />

          </div>

        </div>
      </div>
    </div>
  );
}