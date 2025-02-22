import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const MAX_LOG_FILES = 5; // Keep last 5 log files

export const handleLogWrite = async (req: Request) => {
  const { logs, timestamp } = await req.json();
  
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }

  // Create filename with date
  const date = new Date(timestamp);
  const filename = `app-${date.toISOString().split('T')[0]}.log`;
  const filepath = path.join(LOG_DIR, filename);

  // Append logs to file
  fs.appendFileSync(filepath, logs + '\n');

  // Cleanup old log files
  const files = fs.readdirSync(LOG_DIR)
    .filter(file => file.endsWith('.log'))
    .sort()
    .reverse();

  // Remove excess log files
  if (files.length > MAX_LOG_FILES) {
    files.slice(MAX_LOG_FILES).forEach(file => {
      fs.unlinkSync(path.join(LOG_DIR, file));
    });
  }

  return new Response('Logs written successfully', { status: 200 });
}; 