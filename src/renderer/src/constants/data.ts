export const PREDEFINED_OCCUPATIONS = [
  "Abade", "Celeireiro ou Ecônomo", "Companheiro ou secretário pessoal do abade",
  "Conventual ou Colegial", "Cronista", "Definidor", "Doutor", "Donato ou Irmão Leigo",
  "Frei", "Jubilado", "Mestre", "Mestre de Noviços", "Noviço", "Padre", "Passante",
  "Postulante", "Pregador", "Pregador geral", "Pregador úrbico ou urbano", "Presidente",
  "Prior", "Procurador", "Provedor", "Provincial", "Religioso", "Reverendo",
  "Secretário geral", "Subprior", "Visitador", "Vogal"
];

export const FILTER_GROUPS = [
  {
    title: "Vida Civil & Origem",
    fields: [
      { key: 'pais_nascimento', label: 'País Nascimento', type: 'select' },
      { key: 'cidade_nascimento', label: 'Cidade Nascimento', type: 'select' },
      { key: 'data_nascimento', label: 'Data Nascimento', type: 'date', placeholder: 'DD/MM/AAAA' },
      { key: 'nome_pai', label: 'Nome do Pai', type: 'select' },
      { key: 'nome_mae', label: 'Nome da Mãe', type: 'select' },
      { key: 'local_batismo', label: 'Local Batismo', type: 'select' },
    ]
  },
  {
    title: "Vida Monástica",
    fields: [
      { key: 'ocupacao_oficio', label: 'Ocupação/Ofício', type: 'select' },
      { key: 'data_ingresso_mosteiro', label: 'Data Ingresso', type: 'date', placeholder: 'DD/MM/AAAA' },
      { key: 'local_profissao_religiosa', label: 'Local Profissão', type: 'select' },
      { key: 'data_profissao_religiosa', label: 'Data Profissão', type: 'date', placeholder: 'DD/MM/AAAA' },
      { key: 'materia_ensinada', label: 'Matéria Ensinada', type: 'select' },
    ]
  },
  {
    title: "Legado & Fim",
    fields: [
      { key: 'doencas', label: 'Doenças/Causa Mortis', type: 'select' },
      { key: 'data_falecimento', label: 'Data Falecimento', type: 'date', placeholder: 'DD/MM/AAAA' },
    ]
  }
];