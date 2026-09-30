import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline/promises";

const prompt = createInterface({ input: process.stdin, output: process.stdout });
const password = process.env.CHANDA_ADMIN_PASSWORD || await prompt.question("Choose the Chanda admin password (it will not be saved): ");
prompt.close();
if (password.length < 12) { console.error("Use at least 12 characters."); process.exit(1); }
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
console.log(`CHANDA_ADMIN_PASSWORD_HASH=scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`);
