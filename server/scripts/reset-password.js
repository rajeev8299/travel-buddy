// Operator-only password reset: `npm run reset-password -- someone@example.com`
// Prompts for the new password (not echoed), saves it, and signs the account
// out everywhere. There's no self-service reset until the app can send email.
import readline from "node:readline";
import bcrypt from "bcryptjs";
import { db } from "../src/db.js";

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  // Print the prompt, but swallow the typed characters.
  rl._writeToOutput = (s) => {
    if (s.startsWith(question)) process.stdout.write(question);
  };
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    }),
  );
}

const email = (process.argv[2] || "").trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run reset-password -- <email>");
  process.exit(1);
}

const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
if (!user) {
  console.error(`No account with email ${email}.`);
  process.exit(1);
}

const password = await ask("New password: ");
if (password.length < 8) {
  console.error("Use at least 8 characters.");
  process.exit(1);
}
if ((await ask("Repeat it: ")) !== password) {
  console.error("Passwords don't match.");
  process.exit(1);
}

db.prepare("UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?").run(
  await bcrypt.hash(password, 10),
  user.id,
);
console.log(`Password reset for ${email}. Existing sessions were signed out.`);
