import crypto from "crypto";

// Simple encryption key (in production, you might want to use a more secure approach)
const ENCRYPTION_KEY = "monad-games-secure-key-2024";

// Function to derive encryption key using SHA-256
export const deriveEncryptionKey = (): Buffer => {
  return crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
};

// Function to encrypt data using AES-256-CBC
export const encryptData = (data: string): string => {
  const key = deriveEncryptionKey();
  const iv = crypto.randomBytes(16); // Generate a random IV
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`; // Store IV along with the encrypted data
};

// Function to decrypt data using AES-256-CBC
export const decryptData = (encryptedData: string): string => {
  const key = deriveEncryptionKey();
  const [ivHex, encryptedHex] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString();
};
