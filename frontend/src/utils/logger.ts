import { useState } from "react";

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  title: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private readonly MAX_LOGS = 1000; // Maximum number of logs to keep
  private readonly STORAGE_KEY = 'app_logs';
  private readonly IS_PRODUCTION = process.env.NODE_ENV === 'production';

  private styles = {
    debug: 'color: #9B9B9B',
    info: 'color: #9b87f5',
    warn: 'color: #F59E0B',
    error: 'color: #DC2626',
  };

  private constructor() {
    if (!this.IS_PRODUCTION) {
      console.log('🔧 Logger initialized in development mode');
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private saveLog(level: LogLevel, title: string, data?: any) {
    // Only save logs in development or if they are errors
    if (this.IS_PRODUCTION && level !== 'error') return;

    try {
      // Create new log entry
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        title,
        data: this.sanitizeData(data)
      };

      // Get existing logs
      const existingLogs = this.getLogs();
      existingLogs.push(entry);

      // Keep only the last MAX_LOGS entries
      const trimmedLogs = existingLogs.slice(-this.MAX_LOGS);

      // Save back to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedLogs));
    } catch (error) {
      console.error('Failed to save log:', error);
    }
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    
    try {
      const sanitized = JSON.parse(JSON.stringify(data));
      if (typeof sanitized === 'object') {
        ['password', 'token', 'key', 'secret'].forEach(field => {
          if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
          }
        });
      }
      return sanitized;
    } catch (error) {
      return String(data);
    }
  }

  public getLogs(): LogEntry[] {
    try {
      const logs = localStorage.getItem(this.STORAGE_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to get logs:', error);
      return [];
    }
  }

  public clearLogs(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    if (!this.IS_PRODUCTION) {
      console.log('Logs cleared');
    }
  }

  private logWithGroup(level: LogLevel, title: string, data?: any) {
    // Skip non-error logs in production
    if (this.IS_PRODUCTION && level !== 'error') return;

    const timestamp = new Date().toLocaleTimeString();
    const formattedTitle = `[${timestamp}] ${level.toUpperCase()} ${title}`;
    
    // Console logging
    console.group(`%c${formattedTitle}`, this.styles[level]);
    if (data !== undefined) {
      console.log('Data:', data);
    }
    console.groupEnd();

    // Save to storage
    this.saveLog(level, title, data);
  }

  public debug(title: string, data?: any) {
    if (!this.IS_PRODUCTION) {
      this.logWithGroup('debug', `🔍 ${title}`, data);
    }
  }

  public info(title: string, data?: any) {
    if (!this.IS_PRODUCTION) {
      this.logWithGroup('info', `ℹ️ ${title}`, data);
    }
  }

  public warn(title: string, data?: any) {
    if (!this.IS_PRODUCTION || process.env.REACT_APP_SHOW_WARNINGS === 'true') {
      this.logWithGroup('warn', `⚠️ ${title}`, data);
    }
  }

  public error(title: string, error?: any) {
    this.logWithGroup('error', `❌ ${title}`, error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }

  public auth(title: string, data?: any) {
    if (!this.IS_PRODUCTION) {
      this.logWithGroup('info', `🔐 ${title}`, data);
    }
  }

  public api(title: string, data?: any) {
    if (!this.IS_PRODUCTION) {
      this.logWithGroup('info', `🌐 ${title}`, data);
    }
  }

  public success(title: string, data?: any) {
    if (!this.IS_PRODUCTION) {
      this.logWithGroup('info', `✅ ${title}`, data);
    }
  }

  // Helper method to get logs as text
  public getLogsAsText(): string {
    const logs = this.getLogs();
    return logs.map(log => {
      return `[${log.timestamp}] ${log.level.toUpperCase()} ${log.title}${
        log.data ? '\n' + JSON.stringify(log.data, null, 2) : ''
      }`
    }).join('\n---\n');
  }

  // Helper method to download logs
  public downloadLogs(): void {
    const text = this.getLogsAsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-logs-${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const logger = Logger.getInstance();

// Only log in development
if (process.env.NODE_ENV !== 'production') {
  logger.info('Logger Ready', { timestamp: new Date().toISOString() });
} 