import { execSync } from 'child_process';

export function publishSDK() {
  execSync('npm version patch', { stdio: 'inherit' });
  execSync('npm publish --access public', { stdio: 'inherit' });
}
