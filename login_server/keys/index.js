const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const PUBLIC_KEY_PATH = path.join(__dirname, "public.pem");
const PRIVATE_KEY_PATH = path.join(__dirname, "private.pem");

const createKeys = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

  const publicKeyPem = publicKey.export({ type: "pkcs1", format: "pem" }).toString();
  const privateKeyPem = privateKey.export({ type: "pkcs1", format: "pem" }).toString();

  return { publicKeyPem, privateKeyPem };
};

const setPublicKeyPem = (publicKeyPem) => {
  fs.writeFileSync(PUBLIC_KEY_PATH, publicKeyPem, "utf8");
};

const setPrivateKeyPem = (privateKeyPem) => {
  fs.writeFileSync(PRIVATE_KEY_PATH, privateKeyPem, "utf8");
};

const ensureKeyPair = () => {
  const hasPublicKey = fs.existsSync(PUBLIC_KEY_PATH);
  const hasPrivateKey = fs.existsSync(PRIVATE_KEY_PATH);

  if (hasPublicKey && hasPrivateKey) {
    return;
  }

  const { publicKeyPem, privateKeyPem } = createKeys();
  setPublicKeyPem(publicKeyPem);
  setPrivateKeyPem(privateKeyPem);
};

const getPubKeyPem = () => {
  ensureKeyPair();
  return fs.readFileSync(PUBLIC_KEY_PATH, "utf8");
};

const getPrivateKeyPem = () => {
  ensureKeyPair();
  return fs.readFileSync(PRIVATE_KEY_PATH, "utf8");
};

function privateDecrypt(encrypted) {
  if (typeof encrypted !== "string" || encrypted.trim() === "") {
    throw { msg: "encrypted is required", code: 400, validate: null };
  }

  const privateKeyPem = getPrivateKeyPem();
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const encryptedData = Buffer.from(encrypted, "base64");

  const decryptedBuffer = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    encryptedData,
  );

  return JSON.parse(decryptedBuffer.toString("utf8"));
}

module.exports = {
  getPubKeyPem,
  getPrivateKeyPem,
  privateDecrypt,
};
