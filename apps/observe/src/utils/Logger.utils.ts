export class Logger {
  static async log(value: string): Promise<void> {
    console.log(`[${new Date().toLocaleTimeString()}] | Logger: ${value}`);
  }
}
