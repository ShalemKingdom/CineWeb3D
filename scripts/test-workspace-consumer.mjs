import {mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const root = await mkdtemp(join(tmpdir(), 'cine-modular-consumer-'));
const packages = resolve('distribution/packages');
function run(cwd, command, args) {
  const result = spawnSync(command, args, {cwd, encoding: 'utf8', timeout: 120000, env: {...process.env, npm_config_cache: process.env.CINE_NPM_CACHE || join(tmpdir(), 'cine-npm-cache')}});
  if (result.status !== 0) throw Error(`${command} ${args.join(' ')} failed: ${result.stderr}\n${result.stdout}`);
  return result.stdout.trim();
}
try {
  const artifacts = {};
  for (const name of ['core', 'cli', 'skill', 'templates', 'tools']) {
    const filename = run(join(packages, name), 'npm', ['pack', '--ignore-scripts', '--silent', '--pack-destination', root]).split(/\r?\n/).at(-1);
    artifacts[name] = join(root, filename);
  }
  const consumer = join(root, 'consumer');
  await mkdir(consumer);
  await writeFile(join(consumer, 'package.json'), '{"name":"cine-consumer","private":true,"version":"1.0.0"}\n');
  run(consumer, 'npm', ['install', '--ignore-scripts', ...Object.values(artifacts)]);
  const cli = join(consumer, 'node_modules', '@cineweb3d', 'cli', 'cli.mjs');
  run(consumer, process.execPath, [cli, 'doctor']);
  const skillRoot = join(root, 'skills');
  run(consumer, process.execPath, [cli, 'skill-install', '--skill-root', skillRoot]);
  if (!(await readFile(join(skillRoot, 'cineweb3d', 'SKILL.md'), 'utf8')).includes('name: cineweb3d')) throw Error('Skill name missing');
  run(consumer, process.execPath, [cli, 'skill-uninstall', '--skill-root', skillRoot]);
  run(consumer, process.execPath, [cli, 'create', 'site']);
  const site = join(consumer, 'site');
  run(site, 'npm', ['install', '--ignore-scripts', artifacts.core]);
  run(site, 'npm', ['run', 'build']);
  const html = await readFile(join(site, 'dist', 'index.html'), 'utf8');
  if (!html.includes('noindex') || !html.includes('Café Aurora')) throw Error('Missing preview content');
  console.log('PASS: five local tarballs, CLI doctor, skill installation, generated site installation and build');
} finally {
  await rm(root, {recursive: true, force: true});
}
