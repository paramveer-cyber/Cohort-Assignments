import { createHash, randomBytes } from 'crypto';

export function generateSalt() {
    return randomBytes(32).toString('hex');
}

export function hashPassword(password: string, salt: string) {
    return createHash('sha256').update(password + salt).digest('hex');
}

export function verifyPassword(password: string, salt: string, storedHash: string) {
    return hashPassword(password, salt) === storedHash;
}
