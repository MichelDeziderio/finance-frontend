import { mkdir, writeFile } from 'node:fs/promises';

const fallbackApiUrl = 'http://localhost:3000/api';
const apiUrl = (process.env.API_URL?.trim() || fallbackApiUrl).replace(/\/+$/, '');
const environmentPath = new URL('../src/environments/environment.production.ts', import.meta.url);
const contents = `export const environment = {\n  apiUrl: ${JSON.stringify(apiUrl)}\n};\n`;

await mkdir(new URL('../src/environments/', import.meta.url), { recursive: true });
await writeFile(environmentPath, contents);
