import process from 'node:process';

export async function dynamicImport(filepath: string) {
  return import(/* webpackIgnore: true */ process.platform === 'win32' ? `file://${filepath}` : filepath);
}
