import fs from 'fs/promises';
import path from 'path';
import { AppError } from '../errors/AppError.js';
import { env } from '../config/env.js';
import { databaseRepository } from '../repositories/database.repository.js';
import { Configuracoes } from '../types/index.js';
import { getQrCodeExtension } from '../middleware/upload.js';

export class CategoriaService {
  async findAll(): Promise<string[]> {
    const db = await databaseRepository.read();
    return [...db.configuracoes.categorias];
  }

  async create(nome: string): Promise<string[]> {
    if (!nome?.trim()) {
      throw new AppError('Nome da categoria é obrigatório');
    }

    await databaseRepository.write((db) => {
      const exists = db.configuracoes.categorias.some(
        (c) => c.toLowerCase() === nome.trim().toLowerCase()
      );
      if (exists) {
        throw new AppError('Categoria já existe', 409, 'DUPLICATE');
      }
      db.configuracoes.categorias.push(nome.trim());
    });

    return this.findAll();
  }

  async update(nomeAntigo: string, nomeNovo: string): Promise<string[]> {
    if (!nomeNovo?.trim()) {
      throw new AppError('Nome da categoria é obrigatório');
    }

    await databaseRepository.write((db) => {
      const index = db.configuracoes.categorias.findIndex(
        (c) => c.toLowerCase() === decodeURIComponent(nomeAntigo).toLowerCase()
      );
      if (index === -1) {
        throw new AppError('Categoria não encontrada', 404);
      }

      const exists = db.configuracoes.categorias.some(
        (c, i) => i !== index && c.toLowerCase() === nomeNovo.trim().toLowerCase()
      );
      if (exists) {
        throw new AppError('Categoria já existe', 409, 'DUPLICATE');
      }

      const oldName = db.configuracoes.categorias[index];
      db.configuracoes.categorias[index] = nomeNovo.trim();

      db.produtos.forEach((p) => {
        if (p.categoria === oldName) {
          p.categoria = nomeNovo.trim();
        }
      });
    });

    return this.findAll();
  }

  async delete(nome: string): Promise<string[]> {
    await databaseRepository.write((db) => {
      const decodedNome = decodeURIComponent(nome);
      const index = db.configuracoes.categorias.findIndex(
        (c) => c.toLowerCase() === decodedNome.toLowerCase()
      );
      if (index === -1) {
        throw new AppError('Categoria não encontrada', 404);
      }

      const inUse = db.produtos.some(
        (p) => p.categoria.toLowerCase() === decodedNome.toLowerCase()
      );
      if (inUse) {
        throw new AppError(
          'Não é possível excluir categoria em uso por produtos',
          409,
          'IN_USE'
        );
      }

      db.configuracoes.categorias.splice(index, 1);
    });

    return this.findAll();
  }
}

export class ConfigService {
  async get(): Promise<Configuracoes> {
    const db = await databaseRepository.read();
    return {
      ...db.configuracoes,
      categorias: [...db.configuracoes.categorias],
      chavePix: db.configuracoes.chavePix ?? '',
      mensagemContribuicao: db.configuracoes.mensagemContribuicao ?? '',
      qrCodePix: db.configuracoes.qrCodePix ?? '',
    };
  }

  async update(
    data: Partial<
      Pick<Configuracoes, 'tituloLista' | 'nomeBebe' | 'chavePix' | 'mensagemContribuicao'>
    >,
    userId?: number,
    senhaAtual?: string,
    senhaNova?: string
  ): Promise<Configuracoes> {
    const chavePix = data.chavePix !== undefined ? data.chavePix.trim() : undefined;

    await databaseRepository.write((db) => {
      if (data.tituloLista !== undefined) {
        db.configuracoes.tituloLista = data.tituloLista.trim();
      }
      if (data.nomeBebe !== undefined) {
        db.configuracoes.nomeBebe = data.nomeBebe.trim();
      }
      if (data.chavePix !== undefined) {
        db.configuracoes.chavePix = chavePix ?? '';
      }
      if (data.mensagemContribuicao !== undefined) {
        db.configuracoes.mensagemContribuicao = data.mensagemContribuicao.trim();
      }
    });

    if (senhaNova && userId) {
      const { authService } = await import('./auth.service.js');
      await authService.changePassword(userId, senhaAtual || '', senhaNova);
    }

    return this.get();
  }

  private async removeExistingQrCodeFiles(): Promise<void> {
    await fs.mkdir(env.uploadsPath, { recursive: true });
    const files = await fs.readdir(env.uploadsPath);
    await Promise.all(
      files
        .filter((file) => file.startsWith('qrcode-pix.'))
        .map((file) => fs.unlink(path.join(env.uploadsPath, file)))
    );
  }

  async uploadQrCode(buffer: Buffer, mimetype: string): Promise<Configuracoes> {
    const ext = getQrCodeExtension(mimetype);
    const filename = `qrcode-pix.${ext}`;
    const filePath = path.join(env.uploadsPath, filename);

    await this.removeExistingQrCodeFiles();
    await fs.mkdir(env.uploadsPath, { recursive: true });
    await fs.writeFile(filePath, buffer);

    await databaseRepository.write((db) => {
      db.configuracoes.qrCodePix = filename;
    });

    return this.get();
  }

  async deleteQrCode(): Promise<Configuracoes> {
    await this.removeExistingQrCodeFiles();

    await databaseRepository.write((db) => {
      db.configuracoes.qrCodePix = '';
    });

    return this.get();
  }
}

export const categoriaService = new CategoriaService();
export const configService = new ConfigService();
