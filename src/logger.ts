import path from 'path';
import winston from 'winston';
const { combine, timestamp, printf, colorize, label } = winston.format;

export class Logger {
  static root: string = '';

  static getLogger(file: string) {
    const _label = path.relative(this.root, file);

    const consoleLogger = new winston.transports.Console({
      format: format_console(_label),
    });

    const HTTPLogger = new winston.transports.Http({
      host: 'localhost',
      port: 8080,
      path: '/log',
      format: format_base(_label),
    });
    
    return winston.createLogger({ transports: [ consoleLogger, HTTPLogger ] });
  }
}

function preprocessError(info: winston.Logform.TransformableInfo) {
  if (!(info instanceof Error)) return info;

  return Object.assign({}, info, {
    stack: info.stack,
    message: info.message,
  });
}

function format_base(_label: string) {
  return combine(
    winston.format(preprocessError)(),
    label({ label: _label }),
    timestamp({ format: 'YY-MM-DD HH:mm:ss' }),
  );
}

function format_console(_label: string) {
  const colors = {
    error: 'bold red',
    warn: 'italic yellow',
    info: 'bold blue',
    debug: 'green',
  };

  return combine(
    format_base(_label),
    printf(info => colorize({ colors })
      .colorize(info.level, `[ ${info.label} ] ${[info.timestamp]} ${info.level}: ${info.message}`)),
  );
}
