import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Ruta estilo __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔄 Limpiar pantalla
process.stdout.write('\x1Bc');

// 🎨 Banner principal
console.log(
  gradient.cristal(
    figlet.textSync('KALI BASH', { horizontalLayout: 'full' })
  )
);

const VERSION = chalk.gray('\n\n                        [ Kali Bash v1.0 ]');
console.log(VERSION);

// 📦 Cargar comandos de ./comandos
const comandos = new Map();
const comandosPath = path.join(__dirname, 'comandos');

const archivos = fs.readdirSync(comandosPath).filter(f => f.endsWith('.js'));

for (const file of archivos) {
  const { default: comando } = await import(`./comandos/${file}`);
  const nombre = file.replace('.js', '');
  comandos.set(nombre, comando);
}

// 🧠 Terminal interactiva estilo root@kali
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.red('root') + chalk.white('@kali-Bash') + chalk.cyan(':~# ')
});

rl.prompt();

rl.on('line', async (linea) => {
  const args = linea.trim().split(' ');
  const comando = args.shift();

  if (!comando) return rl.prompt();

  if (comando === 'exit') {
    console.log(chalk.yellow('👋 Cerrando terminal...'));
    rl.close();
    return;
  }

  if (comandos.has(comando)) {
    try {
      const resultado = await comandos.get(comando).run(args); // ✅ await agregado

      if (resultado === '\x1Bc') {
        process.stdout.write('\x1Bc');
        console.log(
          gradient.cristal(
            figlet.textSync('KALI BASH', { horizontalLayout: 'full' })
          )
        );
        console.log(VERSION);
      } else if (resultado) {
        console.log(resultado);
      }
    } catch (err) {
      console.log(chalk.red(`[!] Error ejecutando ${comando}: ${err.message}`));
    }
  } else {
    console.log(chalk.red(`[!] Comando no encontrado: ${comando}`));
  }

  rl.prompt();
});
