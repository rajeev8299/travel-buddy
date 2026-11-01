import crypto from "node:crypto";

// No 0/O or 1/I/L, so a reference read out over the phone can't be misheard.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const LENGTH = 8;

export function makeReferenceCode() {
  let code = "";
  for (let i = 0; i < LENGTH; i++) code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return `TOB-${new Date().getFullYear()}-${code}`;
}

// References are primary keys, so a (rare) collision would otherwise surface
// as a 500 and lose the submission — retry with a fresh code instead.
export function insertWithReference(insert) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = makeReferenceCode();
    try {
      insert(id);
      return id;
    } catch (err) {
      if (!/UNIQUE constraint failed/.test(err.message || "")) throw err;
    }
  }
  throw new Error("Could not allocate a unique reference.");
}
