import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Use a 32-byte key. In production, this should be in .env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    // Ensure key is 32 bytes (if string, hash it or slice it, but better to use correct length key)
    // For simplicity with fallback, we'll assume the key is hex string of 32 bytes or we derive it.
    // If ENCRYPTION_KEY is just a string, we might need to hash it to get 32 bytes.
    // Let's use scrypt or just Buffer.from if it's hex.

    let key: Buffer;
    if (process.env.ENCRYPTION_KEY) {
        // If provided in env, assume it's a secure key or passphrase. 
        // If it's hex and 64 chars (32 bytes), use it directly.
        if (process.env.ENCRYPTION_KEY.length === 64) {
            key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
        } else {
            // If it's a passphrase, hash it to get 32 bytes
            key = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY).digest();
        }
    } else {
        // Fallback for dev
        key = crypto.createHash('sha256').update('fallback_secret_key_for_dev_only').digest();
    }

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');

    let key: Buffer;
    if (process.env.ENCRYPTION_KEY) {
        if (process.env.ENCRYPTION_KEY.length === 64) {
            key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
        } else {
            key = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY).digest();
        }
    } else {
        key = crypto.createHash('sha256').update('fallback_secret_key_for_dev_only').digest();
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
