import { generateKeyPairSync } from "crypto";

let _privateKey, _publicKey, _kid;

function init() {
    if (_privateKey) return;
    const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    _privateKey = privateKey;
    _publicKey = publicKey;
    _kid = `key-${Date.now()}`;
}

export function getPrivateKey() { init(); return _privateKey; }
export function getPublicKey()  { init(); return _publicKey;  }
export function getKid()        { init(); return _kid;        }

export function buildJwk() {
    init();
    const pub = _publicKey.export({ format: "jwk" });
    return { ...pub, use: "sig", alg: "RS256", kid: _kid };
}