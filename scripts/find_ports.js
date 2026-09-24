import { execSync } from 'child_process';

try {
  const ports = execSync('lsof -i -P -n | grep LISTEN', { encoding: 'utf8' });
  console.log("Active listening ports:\n", ports);
} catch (e) {
  console.log("lsof error:", e.message);
}
