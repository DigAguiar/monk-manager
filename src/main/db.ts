import Database from 'better-sqlite3';
import { app } from 'electron';
import { join } from 'path';

const dbPath = app.isPackaged
  ? join(app.getPath('userData'), 'monges.db')
  : join(__dirname, '../../monges.db');

// Mudamos de 'const' para 'let' para poder reconectar
let db: any;

// Função para fechar conexão (libera o arquivo para ser substituído)
export function closeDB() {
  if (db && db.open) {
    db.close();
  }
}

// Função para conectar (ou reconectar)
export function connectDB() {
  // Se já estiver aberto, fecha antes
  if (db && db.open) db.close();

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  
  // Garante que a estrutura existe
  initTables();
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS monges (
      id TEXT PRIMARY KEY,
      nome TEXT,
      ocupacao_oficio TEXT,
      data_nascimento TEXT,
      pais_nascimento TEXT,
      cidade_nascimento TEXT,
      nome_mae TEXT,
      nome_pai TEXT,
      data_batismo TEXT,
      local_batismo TEXT,
      data_ingresso_mosteiro TEXT,
      data_profissao_religiosa TEXT,
      local_profissao_religiosa TEXT,
      formacao TEXT,
      materia_ensinada TEXT,
      livros TEXT,
      episodios_efemerides TEXT,
      exercicios_espirituais TEXT,
      doencas TEXT,
      data_falecimento TEXT,
      nome_abade TEXT,
      observacoes TEXT,
      referencia_manuscrito TEXT,
      referencia_edicao TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Mantemos o export initDB para compatibilidade, mas ele agora chama o connectDB
export function initDB() {
  connectDB();
}

export const MonkDAO = {
  create: (monk: any) => {
    const defaultValues = {
      data_nascimento: null, pais_nascimento: null, cidade_nascimento: null,
      nome_mae: null, nome_pai: null, data_batismo: null, local_batismo: null,
      data_ingresso_mosteiro: null, data_profissao_religiosa: null,
      local_profissao_religiosa: null, formacao: null,
      materia_ensinada: null, episodios_efemerides: null, exercicios_espirituais: null,
      doencas: null, data_falecimento: null, 
      nome_abade: null, observacoes: null,
      referencia_manuscrito: null, referencia_edicao: null
    };

    const finalMonk = {
      ...defaultValues,
      ...monk,
      livros: JSON.stringify(monk.livros || []),
      ocupacao_oficio: JSON.stringify(monk.ocupacao_oficio || []) 
    };

    for (const key in finalMonk) {
      if (finalMonk[key] === "") finalMonk[key] = null;
    }

    const stmt = db.prepare(`
      INSERT INTO monges (
        id, nome, ocupacao_oficio, data_nascimento, pais_nascimento, cidade_nascimento, nome_mae, nome_pai,
        data_batismo, local_batismo, data_ingresso_mosteiro, data_profissao_religiosa,
        local_profissao_religiosa, formacao, materia_ensinada,
        livros, episodios_efemerides, exercicios_espirituais, doencas,
        data_falecimento, nome_abade, observacoes, referencia_manuscrito, referencia_edicao
      ) VALUES (
        @id, @nome, @ocupacao_oficio, @data_nascimento, @pais_nascimento, @cidade_nascimento, @nome_mae, @nome_pai,
        @data_batismo, @local_batismo, @data_ingresso_mosteiro, @data_profissao_religiosa,
        @local_profissao_religiosa, @formacao, @materia_ensinada,
        @livros, @episodios_efemerides, @exercicios_espirituais, @doencas,
        @data_falecimento, @nome_abade, @observacoes, @referencia_manuscrito, @referencia_edicao
      )
    `);

    return stmt.run(finalMonk);
  },

  getAll: () => {
    const stmt = db.prepare('SELECT * FROM monges ORDER BY nome ASC');
    const rows = stmt.all();
    return rows.map((row: any) => ({
      ...row,
      livros: row.livros ? JSON.parse(row.livros) : [],
      ocupacao_oficio: row.ocupacao_oficio ? JSON.parse(row.ocupacao_oficio) : []
    }));
  },

  delete: (id: string) => {
    const stmt = db.prepare('DELETE FROM monges WHERE id = ?');
    return stmt.run(id);
  },

  update: (monk: any) => {
    const defaultValues = {
        data_nascimento: null, pais_nascimento: null, cidade_nascimento: null,
        nome_mae: null, nome_pai: null, data_batismo: null, local_batismo: null,
        data_ingresso_mosteiro: null, data_profissao_religiosa: null,
        local_profissao_religiosa: null, formacao: null,
        materia_ensinada: null, episodios_efemerides: null, exercicios_espirituais: null,
        doencas: null, data_falecimento: null, 
        nome_abade: null, observacoes: null,
        referencia_manuscrito: null, referencia_edicao: null
    };

    const finalMonk = {
      ...defaultValues,
      ...monk,
      livros: JSON.stringify(monk.livros || []),
      ocupacao_oficio: JSON.stringify(monk.ocupacao_oficio || [])
    };

    for (const key in finalMonk) {
        if (finalMonk[key] === "") finalMonk[key] = null;
    }
    
    const stmt = db.prepare(`
      UPDATE monges SET
        nome = @nome, ocupacao_oficio = @ocupacao_oficio, data_nascimento = @data_nascimento,
        pais_nascimento = @pais_nascimento, cidade_nascimento = @cidade_nascimento,
        nome_mae = @nome_mae, nome_pai = @nome_pai,
        data_batismo = @data_batismo, local_batismo = @local_batismo,
        data_ingresso_mosteiro = @data_ingresso_mosteiro, 
        data_profissao_religiosa = @data_profissao_religiosa,
        local_profissao_religiosa = @local_profissao_religiosa, formacao = @formacao,
        materia_ensinada = @materia_ensinada,
        livros = @livros, episodios_efemerides = @episodios_efemerides,
        exercicios_espirituais = @exercicios_espirituais, doencas = @doencas,
        data_falecimento = @data_falecimento, nome_abade = @nome_abade, observacoes = @observacoes,
        referencia_manuscrito = @referencia_manuscrito,
        referencia_edicao = @referencia_edicao
      WHERE id = @id
    `);

    return stmt.run(finalMonk);
  }
};