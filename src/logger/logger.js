const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, json } = format;

const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { application: 'HRMlix - ATS' },
  transports: [
    new transports.Console(),
  ],
});

module.exports = logger;