// src/services/userService.ts

// Usamos el módulo 'crypto' de Node.js para hashear contraseñas de forma segura
import crypto from 'crypto';
import { PutCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../utils/database.js"; // Reutiliza el cliente de DynamoDB

// Nota: Asegúrate de que esta variable esté en tu .env y config.json
const USERS_TABLE_NAME = process.env.DYNAMODB_USERS_TABLE_NAME || "app_users";

// ==============================================================================
// 1. TIPOS Y ESTRUCTURA
// ==============================================================================

export interface User {
    user_id: string;
    email: string; // Se usará para el GSI EmailIndex
    name: string;
    password_hash: string;
    salt: string; // Necesario para el algoritmo pbkdf2
    created_at: string;
    provider?: 'local' | 'google' | 'facebook'; // Origen del registro
}

// ==============================================================================
// 2. HELPERS DE SEGURIDAD
// ==============================================================================

/**
 * Genera un hash seguro de la contraseña usando PBKDF2.
 * @param password La contraseña en texto plano.
 * @returns Un objeto con el hash y el salt.
 */
function hashPassword(password: string): { hash: string; salt: string } {
    const salt = crypto.randomBytes(16).toString('hex');
    // Usamos 1000 iteraciones (mínimo) y SHA-512
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return { hash, salt };
}

/**
 * Verifica una contraseña en texto plano contra el hash y el salt almacenados.
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
    // Genera el hash de la contraseña proporcionada usando el mismo salt y parámetros
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
}

// ==============================================================================
// 3. FUNCIONES DE BASE DE DATOS
// ==============================================================================

/**
 * Crea un usuario nuevo en la tabla.
 */
export async function createUser(
    email: string,
    name: string,
    password: string, // Hacemos la contraseña obligatoria en este contexto
    provider: 'local' | 'google' | 'facebook' = 'local'
): Promise<User> {

    // 1. Verificar si el usuario ya existe (usando el GSI)
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw new Error('El usuario ya existe');
    }

    // 2. Hashear la contraseña
    const { hash, salt } = hashPassword(password);

    // 3. Crear el objeto usuario
    const newUser: User = {
        user_id: crypto.randomUUID(),
        email,
        name,
        password_hash: hash,
        salt,
        created_at: new Date().toISOString(),
        provider
    };

    // 4. Guardar en DynamoDB (PK: user_id)
    const command = new PutCommand({
        TableName: USERS_TABLE_NAME,
        Item: newUser,
    });

    await docClient.send(command);
    return newUser;
}

/**
 * Busca un usuario por su email. Requiere el GSI 'EmailIndex'.
 */
export async function findUserByEmail(email: string): Promise<User | null> {
    const command = new QueryCommand({
        TableName: USERS_TABLE_NAME,
        // ¡CRÍTICO! Usamos el índice secundario global (GSI)
        IndexName: "EmailIndex",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
            ":email": email
        }
    });

    const response = await docClient.send(command);
    // Asumimos que el email es único (solo debería devolver 0 o 1 ítem)
    if (response.Items && response.Items.length > 0) {
        return response.Items[0] as User;
    }
    return null;
}

/**
 * Busca un usuario por su ID. Usa la clave principal (PK).
 */
export async function findUserById(user_id: string): Promise<User | null> {
    const command = new GetCommand({
        TableName: USERS_TABLE_NAME,
        // Usamos la clave principal (PK)
        Key: { user_id: user_id }
    });

    const response = await docClient.send(command);
    if (response.Item) {
        return response.Item as User;
    }
    return null;
}