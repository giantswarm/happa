export function log(message: string, newLine: boolean = true): void {
  process.stdout.write(`${message}${newLine ? '\n' : ''}`);
}
