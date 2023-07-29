import path from 'path';
import winston from 'winston';

const { combine, timestamp, printf, colorize, label } = winston.format;

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
  return combine(
    format_base(_label),
    printf(info =>
      colorize({
        colors: {
          error: 'bold red',
          warn: 'italic yellow',
          info: 'bold blue',
          debug: 'green',
        }
      }).colorize(info.level, `[ ${info.label} ] ${[info.timestamp]} ${info.level}: ${info.message}`)
    ),
  );
}

class Logger {
  root: string;

  constructor() {
    this.root = '';
  }

  setRoot(root: string) {
    this.root = root;
  }

  getLogger(file: string) {
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

export const loggerGen = new Logger();
