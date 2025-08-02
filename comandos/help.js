import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  run() {
    const comandosPath = path.join(__dirname);
    const archivos = fs.readdirSync(comandosPath)
      .filter(f => f.endsWith('.js'))
      .map(f => f.replace('.js', ''));

    return chalk.blue('Comandos disponibles:\n') +
      archivos.map(cmd => `  - ${cmd}`).join('\n') +
      '\n  - exit';
  }
};
