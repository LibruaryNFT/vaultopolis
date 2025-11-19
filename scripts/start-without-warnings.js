// Wrapper script to suppress source-map-loader warnings
const { spawn } = require('child_process');

// Start react-scripts and filter out @walletconnect source map warnings
const child = spawn('npx', ['react-scripts', 'start'], {
  shell: process.platform === 'win32', // Only use shell on Windows
  env: {
    ...process.env,
    GENERATE_SOURCEMAP: 'false',
  }
});

// Filter output to remove @walletconnect source map warnings
child.stdout.on('data', (data) => {
  const output = data.toString();
  // Filter out lines containing @walletconnect source map warnings
  const lines = output.split('\n');
  const filtered = lines.filter(line => {
    // Keep the line if it doesn't contain the warning pattern
    return !(line.includes('@walletconnect') && 
             (line.includes('Failed to parse source map') || 
              line.includes('source-map-loader')));
  });
  if (filtered.length > 0) {
    process.stdout.write(filtered.join('\n'));
  }
});

child.stderr.on('data', (data) => {
  const output = data.toString();
  // Filter out @walletconnect warnings but keep errors
  if (!(output.includes('@walletconnect') && 
        output.includes('Failed to parse source map') &&
        !output.includes('ERROR'))) {
    process.stderr.write(data);
  }
});

child.on('exit', (code) => {
  process.exit(code);
});

