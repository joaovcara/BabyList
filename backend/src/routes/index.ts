import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { produtoController, dashboardController } from '../controllers/produto.controller.js';
import { reservaController } from '../controllers/reserva.controller.js';
import { categoriaController, configController } from '../controllers/categoria.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Setup / Auth
router.get('/setup/status', (req, res, next) => authController.setupStatus(req, res, next));
router.post('/setup', (req, res, next) => authController.setup(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));

// Produtos
router.get('/produtos', (req, res, next) => produtoController.findAll(req, res, next));
router.get('/produtos/:id', (req, res, next) => produtoController.findById(req, res, next));
router.post('/produtos', authMiddleware, (req, res, next) => produtoController.create(req, res, next));
router.put('/produtos/:id', authMiddleware, (req, res, next) => produtoController.update(req, res, next));
router.delete('/produtos/:id', authMiddleware, (req, res, next) => produtoController.delete(req, res, next));
router.patch('/produtos/:id/receber', authMiddleware, (req, res, next) => produtoController.receber(req, res, next));

// Reservas
router.get('/reservas', authMiddleware, (req, res, next) => reservaController.findAll(req, res, next));
router.post('/reservas', (req, res, next) => reservaController.create(req, res, next));
router.delete('/reservas/:id', authMiddleware, (req, res, next) => reservaController.delete(req, res, next));

// Categorias
router.get('/categorias', (req, res, next) => categoriaController.findAll(req, res, next));
router.post('/categorias', authMiddleware, (req, res, next) => categoriaController.create(req, res, next));
router.put('/categorias/:nome', authMiddleware, (req, res, next) => categoriaController.update(req, res, next));
router.delete('/categorias/:nome', authMiddleware, (req, res, next) => categoriaController.delete(req, res, next));

// Dashboard / Config
router.get('/dashboard', authMiddleware, (req, res, next) => dashboardController.get(req, res, next));
router.get('/configuracoes', (req, res, next) => configController.get(req, res, next));
router.put('/configuracoes', authMiddleware, (req, res, next) => configController.update(req, res, next));

export default router;
