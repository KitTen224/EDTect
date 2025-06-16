#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Path to next executable
const nextPath = path.join(__dirname, 'node_modules', '.bin', 'next');

console.log('Starting Next.js development server...');
console.log('Next.js path:', nextPath);

// Start the development server
const child = spawn('node', [nextPath, 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
});

child.on('error', (error) => {
    console.error('Failed to start server:', error);
});

child.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
});
