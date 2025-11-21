// src/routers/usersRouter.ts

import { Router, Request, Response } from 'express';
import { createUser } from '../models/User.js';
import { ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../utils/database.js";
import { logger } from '../utils/loggers.js';

const router = Router();
const USERS_TABLE_NAME = process.env.DYNAMODB_USERS_TABLE_NAME || "app_users";

/**
 * GET /api/users
 * Listar todos los usuarios (sin password_hash)
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const command = new ScanCommand({
            TableName: USERS_TABLE_NAME,
            // Opcional: ProjectionExpression para no devolver password_hash
            ProjectionExpression: "user_id, email, #name, created_at, provider",
            ExpressionAttributeNames: { "#name": "name" }
        });

        const response = await docClient.send(command);
        res.json(response.Items || []);
    } catch (error: any) {
        logger.error("Error listando usuarios:", error);
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

/**
 * POST /api/users
 * Crear un nuevo usuario
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, email, password, provider } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: "Nombre y email son requeridos" });
        }

        const newUser = await createUser(email, name, password, provider);

        // No devolver hash
        const { password_hash, ...safeUser } = newUser;
        res.status(201).json(safeUser);

    } catch (error: any) {
        logger.error("Error creando usuario:", error);
        res.status(500).json({ error: error.message || "Error al crear usuario" });
    }
});

/**
 * DELETE /api/users/:id
 * Eliminar un usuario por ID
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const command = new DeleteCommand({
            TableName: USERS_TABLE_NAME,
            Key: { user_id: id }
        });

        await docClient.send(command);
        res.json({ message: "Usuario eliminado correctamente" });

    } catch (error: any) {
        logger.error("Error eliminando usuario:", error);
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
});

export default router;
