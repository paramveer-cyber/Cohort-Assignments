import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const CERT_DIR = path.resolve("cert");
const PRIVATE_KEY_PATH = path.join(CERT_DIR, "private-key.pem");
const PUBLIC_KEY_PATH = path.join(CERT_DIR, "public-key.pub");

function loadKeys() {
    if (!existsSync(PRIVATE_KEY_PATH) || !existsSync(PUBLIC_KEY_PATH)) {
        throw new Error(
            `RSA key files not found in ${CERT_DIR}/. ` +
            `Generate them with:\n` +
            `  openssl genrsa -out cert/private-key.pem 2048\n` +
            `  openssl rsa -in cert/private-key.pem -pubout -out cert/public-key.pub`
        );
    }

    const privateKeyPem = readFileSync(PRIVATE_KEY_PATH);
    const publicKeyPem = readFileSync(PUBLIC_KEY_PATH);

    const privateKey = crypto.createPrivateKey(privateKeyPem);
    const publicKey = crypto.createPublicKey(publicKeyPem);

    const pubJwk = publicKey.export({ format: "jwk" });
    const kid = crypto
        .createHash("sha256")
        .update(pubJwk.n + pubJwk.e)
        .digest("hex")
        .slice(0, 16);

    return { privateKey, publicKey, privateKeyPem, publicKeyPem, kid, pubJwk };
}

const keys = loadKeys();

export const PRIVATE_KEY = keys.privateKeyPem;
export const PUBLIC_KEY = keys.publicKeyPem;

export function getPrivateKey() { return keys.privateKey; }
export function getPublicKey()  { return keys.publicKey;  }
export function getKid()        { return keys.kid;        }

export function buildJwk() {
    return {
        kty: keys.pubJwk.kty,
        n:   keys.pubJwk.n,
        e:   keys.pubJwk.e,
        use: "sig",
        alg: "RS256",
        kid: keys.kid,
    };
}
