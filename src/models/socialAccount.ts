import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../utils/database.js";
import { findUserById } from "./User.js";
import { encrypt } from "../utils/encryption.js";

const USERS_TABLE_NAME = process.env.DYNAMODB_USERS_TABLE_NAME || "app_users";

export interface SocialAccount {
    platform: string;
    page_id: string;
    handle: string;
    access_token: string; // Encrypted
    expires_at: string;
    linked_at: string;
}

export async function saveSocialAccount(
    userId: string,
    platform: string,
    pageId: string,
    handle: string,
    accessToken: string,
    expiresAt: string
): Promise<SocialAccount> {

    // 1. Buscar usuario por ID (PK)
    const user = await findUserById(userId);
    if (!user) {
        throw new Error(`Usuario no encontrado con ID: ${userId}`);
    }

    // 2. Encriptar el token
    const encryptedToken = encrypt(accessToken);

    // 3. Preparar el objeto de la cuenta
    const newAccount: SocialAccount = {
        platform,
        page_id: pageId,
        handle,
        access_token: encryptedToken,
        expires_at: expiresAt,
        linked_at: new Date().toISOString()
    };

    // 4. Obtener cuentas existentes y actualizar
    // (Asumimos que 'social_accounts' existe en el usuario, si no, lo inicializamos)
    let accounts: SocialAccount[] = (user as any).social_accounts || [];

    // Filtrar si ya existe una cuenta para esta misma página/plataforma para sobrescribirla
    accounts = accounts.filter(acc => !(acc.platform === platform && acc.page_id === pageId));

    // Agregar la nueva
    accounts.push(newAccount);

    // 5. Guardar en DynamoDB actualizando el campo social_accounts
    const command = new UpdateCommand({
        TableName: USERS_TABLE_NAME,
        Key: { user_id: user.user_id },
        UpdateExpression: "SET social_accounts = :accounts",
        ExpressionAttributeValues: {
            ":accounts": accounts
        },
        ReturnValues: "UPDATED_NEW"
    });

    await docClient.send(command);

    // Retornamos la cuenta guardada
    return newAccount;
}
