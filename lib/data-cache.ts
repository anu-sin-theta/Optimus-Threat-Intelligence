import fs from 'fs';
import path from 'path';

const DATABASE_DIR = path.join(process.cwd(), 'database');

// Ensure database directory exists
if (!fs.existsSync(DATABASE_DIR)) {
  fs.mkdirSync(DATABASE_DIR, { recursive: true });
}

interface CacheConfig {
  filename: string;
  expiryHours: number;
}

export const DataCache = {
  getNVDData: async (config: CacheConfig) => {
    const filePath = path.join(DATABASE_DIR, config.filename);

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const hoursSinceModified = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);

      if (hoursSinceModified < config.expiryHours) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
      }
    }
    return null;
  },

  saveNVDData: async (data: any, filename: string) => {
    const filePath = path.join(DATABASE_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
};
