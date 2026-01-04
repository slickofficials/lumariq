export function requireSecret(name: string) {
  if (!process.env[name]) {
    throw new Error(`Missing secret: ${name}`);
  }
}
