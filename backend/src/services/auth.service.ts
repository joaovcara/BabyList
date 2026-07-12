import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../errors/AppError.js';
import { databaseRepository } from '../repositories/database.repository.js';
import { nextId } from '../utils/calculations.js';
import { JwtPayload, Usuario, Database } from '../types/index.js';

export class AuthService {
  async needsSetup(): Promise<boolean> {
    const db = await databaseRepository.read();
    return db.usuarios.length === 0;
  }

  async setup(usuario: string, senha: string): Promise<{ token: string; usuario: string }> {
    if (!usuario?.trim()) {
      throw new AppError('Usuário é obrigatório');
    }
    if (!senha || senha.length < 4) {
      throw new AppError('Senha deve ter pelo menos 4 caracteres');
    }

    const needsSetup = await this.needsSetup();
    if (!needsSetup) {
      throw new AppError('Setup já foi realizado', 409, 'SETUP_DONE');
    }

    const hash = await bcrypt.hash(senha, 10);

    let userId = 1;

    await databaseRepository.write((db: Database) => {
      userId = nextId(db.usuarios);
      db.usuarios.push({
        id: userId,
        usuario: usuario.trim(),
        senha: hash,
      });
    });

    return this.generateToken(userId, usuario.trim());
  }

  async login(usuario: string, senha: string): Promise<{ token: string; usuario: string }> {
    if (!usuario?.trim() || !senha) {
      throw new AppError('Usuário e senha são obrigatórios');
    }

    const db = await databaseRepository.read();
    const user = db.usuarios.find(
      (u) => u.usuario.toLowerCase() === usuario.trim().toLowerCase()
    );

    if (!user) {
      throw new AppError('Usuário ou senha inválidos', 401, 'INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(senha, user.senha);
    if (!valid) {
      throw new AppError('Usuário ou senha inválidos', 401, 'INVALID_CREDENTIALS');
    }

    return this.generateToken(user.id, user.usuario);
  }

  async changePassword(
    userId: number,
    senhaAtual: string,
    senhaNova: string
  ): Promise<void> {
    if (!senhaNova || senhaNova.length < 4) {
      throw new AppError('Nova senha deve ter pelo menos 4 caracteres');
    }

    await databaseRepository.write(async (db) => {
      const user = db.usuarios.find((u) => u.id === userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const valid = await bcrypt.compare(senhaAtual, user.senha);
      if (!valid) {
        throw new AppError('Senha atual incorreta', 401, 'INVALID_PASSWORD');
      }

      user.senha = await bcrypt.hash(senhaNova, 10);
    });
  }

  private generateToken(userId: number, usuario: string): { token: string; usuario: string } {
    const payload: JwtPayload = { userId, usuario };
    const token = jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });
    return { token, usuario };
  }

  async findUsuario(): Promise<Omit<Usuario, 'senha'> | null> {
    const db = await databaseRepository.read();
    const user = db.usuarios[0];
    if (!user) return null;
    return { id: user.id, usuario: user.usuario };
  }
}

export const authService = new AuthService();
