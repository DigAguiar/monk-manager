import { useState, useRef, useEffect } from 'react';

interface MultiSelectProps {
  label: string;
  options: string[]; // Opções disponíveis (ex: todas as ocupações já cadastradas)
  value: string[];   // Lista de selecionados
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ label, options, value = [], onChange, placeholder }: MultiSelectProps) {
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

  const handleAdd = (item: string) => {
    if (!value.includes(item)) {
      onChange([...value, item]);
    }
    setSearch('');
    setIsOpen(false);
  };

  const handleRemove = (itemToRemove: string) => {
    onChange(value.filter(item => item !== itemToRemove));
  };

  // Filtra opções disponíveis (que ainda não foram selecionadas)
  const filteredOptions = options
    .filter(opt => !value.includes(opt)) // Remove os já selecionados da lista
    .filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      
      {/* Área de Tags e Input */}
      <div 
        className="min-h-[42px] w-full p-2 border rounded bg-white focus-within:ring-1 focus-within:ring-blue-500 flex flex-wrap gap-2 cursor-text"
        onClick={() => setIsOpen(true)}
      >
        {/* Tags Selecionadas */}
        {value.map(item => (
          <span key={item} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
            {item}
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); handleRemove(item); }}
              className="hover:text-red-600 font-bold"
            >
              ×
            </button>
          </span>
        ))}

        {/* Input de busca/criação */}
        <input 
          type="text"
          className="flex-1 outline-none text-sm min-w-[100px]"
          placeholder={value.length === 0 ? (placeholder || "Selecione ou digite...") : ""}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && search.trim()) {
              e.preventDefault();
              handleAdd(search.trim()); // Permite criar nova ocupação que não existe na lista
            }
          }}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (search || filteredOptions.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded shadow-xl max-h-48 overflow-y-auto">
          
          {/* Opção de criar novo se não existir */}
          {search && !filteredOptions.includes(search) && (
            <div 
              className="p-2 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer font-bold border-b"
              onClick={() => handleAdd(search)}
            >
              + Adicionar "{search}"
            </div>
          )}

          {filteredOptions.map((opt) => (
            <div 
              key={opt}
              className="p-2 text-sm cursor-pointer hover:bg-gray-100"
              onClick={() => handleAdd(opt)}
            >
              {opt}
            </div>
          ))}
          
          {filteredOptions.length === 0 && !search && (
            <div className="p-2 text-sm text-gray-400 italic">Sem sugestões. Digite para adicionar.</div>
          )}
        </div>
      )}
    </div>
  );
}