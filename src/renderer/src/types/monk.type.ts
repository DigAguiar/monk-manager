export interface Monk {
  id?: string;
  nome: string;
  
  ocupacao_oficio: string[];
  
  data_nascimento: string;
  pais_nascimento: string;
  cidade_nascimento: string;
  nome_mae: string;
  nome_pai: string;
  data_batismo: string;
  local_batismo: string;
  data_ingresso_mosteiro: string;
  data_profissao_religiosa: string;
  local_profissao_religiosa: string;
  formacao: string;
  materia_ensinada: string;
  livros: string[];
  episodios_efemerides: string;
  exercicios_espirituais: string;
  doencas: string;
  data_falecimento: string;
  
  nome_abade: string; 
  observacoes: string;
  
  referencia_manuscrito: string;
  referencia_edicao: string;
  created_at?: string;
}