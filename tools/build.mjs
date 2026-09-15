import { cp, mkdir, rm, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, basename } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const output = resolve(root, '_site');
if (dirname(output) !== resolve(root) || basename(output) !== '_site') throw new Error('Build destination must be the project’s _site directory.');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const item of ['index.html', '404.html', '.nojekyll', 'robots.txt', 'sitemap.xml', 'assets', 'projects']) {
  await cp(resolve(root, item), resolve(output, item), { recursive: true });
}
console.log(`Built public portfolio in ${output}`);
console.log('Published entries: ' + (await readdir(output)).join(', '));
