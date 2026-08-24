type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

class Logger {
  private queue: LogEntry[] = [];
  private isProcessing = false;

  async log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
    };

    if (process.env.NODE_ENV === "production") {
      this.queue.push(entry);
      this.processQueue();
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, context);
    }
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const entries = this.queue.splice(0, 10);

    try {
      await fetch("/api/logs", {
        method: "POST",
        body: JSON.stringify(entries),
      });
    } catch (error) {
      console.error("Failed to send logs:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    return this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    return this.log("warn", message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    return this.log("error", message, context);
  }

  debug(message: string, context?: Record<string, unknown>) {
    return this.log("debug", message, context);
  }
}

export const logger = new Logger();
