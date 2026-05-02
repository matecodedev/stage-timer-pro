import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';

const env = { ...process.env };

if (process.platform === 'darwin') {
  const clang = '/Library/Developer/CommandLineTools/usr/bin/clang';
  const ar = '/Library/Developer/CommandLineTools/usr/bin/ar';
  const sdkRoot = '/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk';

  if (existsSync(clang)) {
    env.CC ??= clang;
  }

  if (existsSync(ar)) {
    env.AR ??= ar;
  }

  if (existsSync(sdkRoot)) {
    env.SDKROOT ??= sdkRoot;
  }

  env.MACOSX_DEPLOYMENT_TARGET ??= '11.0';
  env.CARGO_BUILD_JOBS ??= '1';
}

const child = spawn('tauri', ['dev'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
