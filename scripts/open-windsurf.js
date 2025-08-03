import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the Chromium browser
const CHROMIUM_PATH = join(
  process.env.HOME,
  '.codeium',
  'windsurf',
  'ws-browser',
  'chromium-1155',
  'chrome-mac',
  'Chromium.app',
);

async function openWindsurf() {
  try {
    // Start live-server without opening a browser
    const server = exec('npx live-server --port=3000 --no-browser', {
      cwd: join(__dirname, '..', 'public'),
    });

    // Wait a moment for the server to start
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Open Chromium browser with the application
    await execAsync(`open -a "${CHROMIUM_PATH}" http://localhost:3000`);

    console.log('Server started and Chromium browser opened');

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\nStopping server...');
      server.kill();
      process.exit();
    });

    // Log any errors from the server
    server.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

openWindsurf();
