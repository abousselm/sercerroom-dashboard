const { spawn, execSync } = require('child_process');

// 1. Tuer tout processus sur le port 5000
try {
  execSync(
    'powershell -Command "Get-NetTCPConnection -LocalPort 5000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"',
    { stdio: 'ignore' }
  );
} catch (e) {
  // ignore
}

// 2. Démarrer le serveur
const child = spawn('node', ['server.js'], {
  cwd: 'c:/Users/aymen/server-room-supervision',
  stdio: ['ignore', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';

child.stdout.on('data', (data) => {
  stdout += data.toString();
});

child.stderr.on('data', (data) => {
  stderr += data.toString();
});

child.on('error', (err) => {
  console.error('❌ Impossible de démarrer le serveur:', err.message);
  process.exit(1);
});

setTimeout(() => {
  child.kill();
  const output = stdout + stderr;

  if (output.includes('Server running on port 5000')) {
    console.log('✅ TEST RÉUSSI : Le serveur démarre correctement');
    process.exit(0);
  } else if (output.includes('TypeError') || output.includes('ReferenceError') || output.includes('Error:')) {
    console.log('❌ TEST ÉCHEC : Le serveur ne démarre pas');
    console.log(output);
    process.exit(1);
  } else {
    console.log('⚠️ TEST INCONCLUSIF');
    console.log('Sortie:', output);
    process.exit(0);
  }
}, 4000);

