import { PutCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../utils/database.js";
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const USERS_TABLE_NAME = process.env.DYNAMODB_USERS_TABLE_NAME || "app_users";

export interface User {
    user_id: string;
    email: string;
    name: string;
    password_hash: string;
    created_at: string;
    provider?: 'local' | 'google' | 'facebook';
}

// Helper para hashear contraseñas
async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Helper para verificar contraseñas
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

export async function createUser(
    email: string,
    name: string,
    password?: string,
    provider: 'local' | 'google' | 'facebook' = 'local'
): Promise<User> {

    // Verificar si el usuario ya existe
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw new Error('El usuario ya existe');
    }

    const user_id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    let password_hash = '';

    if (password) {
        password_hash = await hashPassword(password);
    }

    const newUser: User = {
        user_id,
        email,
        name,
        password_hash,
        created_at,
        provider
    };

    const command = new PutCommand({
        TableName: USERS_TABLE_NAME,
        Item: newUser,
    });

    await docClient.send(command);
    return newUser;
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const command = new QueryCommand({
        TableName: USERS_TABLE_NAME,
        IndexName: "EmailIndex", // Necesitarás crear este GSI en DynamoDB
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
            ":email": email
        }
    });

    const response = await docClient.send(command);
    if (response.Items && response.Items.length > 0) {
        return response.Items[0] as User;
    }
    return null;
}

export async function findUserById(user_id: string): Promise<User | null> {
    const command = new GetCommand({
        TableName: USERS_TABLE_NAME,
        Key: { user_id }
    });

    const response = await docClient.send(command);
    if (response.Item) {
        return response.Item as User;
    }
    return null;
}
