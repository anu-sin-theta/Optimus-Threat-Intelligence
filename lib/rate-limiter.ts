
import { promises as fs } from 'fs';
import path from 'path';

const MAX_CALLS = 4;
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

interface APICalls {
  count: number;
  timestamp: number;
}

export class RateLimiter {
  private static async ensureDatabaseDir(): Promise<void> {
    const dbDir = path.join(process.cwd(), 'database');
    try {
      await fs.access(dbDir);
    } catch {
      await fs.mkdir(dbDir, { recursive: true });
    }
  }

  private static getCallsFilePath(api: string): string {
    return path.join(process.cwd(), 'database', `${api}-calls.json`);
  }

  static async isAllowed(api: string): Promise<boolean> {
    await this.ensureDatabaseDir();
    const calls = await this.getCalls(api);
    const now = Date.now();

    if (now - calls.timestamp > TWENTY_FOUR_HOURS) {
      await this.resetCalls(api);
      return true;
    }

    return calls.count < MAX_CALLS;
  }

  static async increment(api: string): Promise<void> {
    await this.ensureDatabaseDir();
    const calls = await this.getCalls(api);
    const now = Date.now();

    if (now - calls.timestamp > TWENTY_FOUR_HOURS) {
      await this.resetCalls(api);
      calls.count = 0;
      calls.timestamp = now;
    }

    calls.count++;
    await this.saveCalls(api, calls);
  }

  private static async getCalls(api: string): Promise<APICalls> {
    try {
      const filePath = this.getCallsFilePath(api);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return { count: 0, timestamp: 0 };
    }
  }

  private static async saveCalls(api: string, calls: APICalls): Promise<void> {
    const filePath = this.getCallsFilePath(api);
    await fs.writeFile(filePath, JSON.stringify(calls));
  }

  private static async resetCalls(api: string): Promise<void> {
    await this.saveCalls(api, { count: 0, timestamp: Date.now() });
  }
}
