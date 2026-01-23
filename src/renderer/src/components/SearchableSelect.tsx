import { useState, useRef, useEffect } from 'react';

interface SearchableSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchableSelect({ label, options, value, onChange, placeholder }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Filtra opções
  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 truncate" title={label}>
        {label}
      </label>
      
      <div className="relative">
        <input 
          type="text"
          className="w-full p-2 text-sm border rounded bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
          placeholder={placeholder || "Todos"}
          value={isOpen ? search : value}
          
          // Lógica corrigida para evitar conflito de clique
          onClick={() => setIsOpen(true)}
          onFocus={() => setIsOpen(true)}
          
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
            if (e.target.value === '') onChange('');
          }}
        />
        {/* Seta para baixo (Apenas visual agora, o input controla tudo) */}
        <div className="absolute right-2 top-2.5 text-gray-400 text-xs pointer-events-none">
          ▼
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded shadow-xl max-h-48 overflow-y-auto animate-fade-in">
          <div 
            className="p-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer border-b italic"
            onClick={() => {
              onChange('');
              setSearch('');
              setIsOpen(false);
            }}
          >
            Limpar seleção
          </div>
          
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div 
                key={opt}
                className={`p-2 text-sm cursor-pointer hover:bg-blue-50 ${opt === value ? 'bg-blue-100 font-bold' : ''}`}
                // O onMouseDown previne que o input perca o foco antes do clique registrar
                onMouseDown={(e) => e.preventDefault()} 
                onClick={() => {
                  onChange(opt);
                  setSearch('');
                  setIsOpen(false);
                }}
              >
                {opt}
              </div>
            ))
          ) : (
            <div className="p-2 text-sm text-gray-400 italic">Nada encontrado</div>
          )}
        </div>
      )}
    </div>
  );
}