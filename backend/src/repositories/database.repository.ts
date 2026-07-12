import fs from 'fs/promises';
import path from 'path';
import lockfile from 'proper-lockfile';
import { env } from '../config/env.js';
import { Database, Configuracoes } from '../types/index.js';

const DEFAULT_DATABASE: Database = {
  usuarios: [],
  produtos: [],
  reservas: [],
  configuracoes: {
    tituloLista: 'Enxoval do Bebê',
    nomeBebe: '',
    chavePix: '',
    mensagemContribuicao: '',
    qrCodePix: '',
    categorias: [
      'Roupas',
      'Banho',
      'Higiene',
      'Alimentação',
      'Passeio',
      'Quarto',
      'Saúde',
      'Brinquedos',
      'Outros',
    ],
    tamanhos: ['RN', 'P', 'M', 'G', 'XG', 'XXG', 'Único'],
  },
};

export class DatabaseRepository {
  private readonly dbPath: string;

  constructor(dbPath: string = env.databasePath) {
    this.dbPath = dbPath;
  }

  async initialize(): Promise<void> {
    const dir = path.dirname(this.dbPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.mkdir(env.uploadsPath, { recursive: true });

    try {
      await fs.access(this.dbPath);
    } catch {
      await fs.writeFile(
        this.dbPath,
        JSON.stringify(DEFAULT_DATABASE, null, 2),
        'utf-8'
      );
    }
  }

  async read(): Promise<Database> {
    await this.initialize();
    const content = await fs.readFile(this.dbPath, 'utf-8');
    return JSON.parse(content) as Database;
  }

  async write(mutator: (db: Database) => void | Promise<void>): Promise<Database> {
    await this.initialize();

    let release: (() => Promise<void>) | undefined;

    try {
      release = await lockfile.lock(this.dbPath, {
        retries: {
          retries: 5,
          minTimeout: 100,
          maxTimeout: 1000,
        },
      });

      const db = await this.read();
      await mutator(db);
      await fs.writeFile(this.dbPath, JSON.stringify(db, null, 2), 'utf-8');
      return db;
    } finally {
      if (release) {
        await release();
      }
    }
  }
}

export const databaseRepository = new DatabaseRepository();

export function getDefaultConfig(): Configuracoes {
  return {
    ...DEFAULT_DATABASE.configuracoes,
    categorias: [...DEFAULT_DATABASE.configuracoes.categorias],
    tamanhos: [...DEFAULT_DATABASE.configuracoes.tamanhos],
  };
}
