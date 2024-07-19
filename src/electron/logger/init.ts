import winston, { format } from 'winston'

const logFormat = format.printf(({level, message, label, timestamp}) => {
    return `${timestamp} [${level}]: ${message}`
})

class CustomerLog {
    private static instance: CustomerLog
    private static logger: winston.Logger
    private constructor(){
    }

    public static getInstance () {
        if (!this.instance) {
            this.instance = new CustomerLog()
            this.createLogger()
        }
        return this.logger
    }

    private static createLogger() {
        const logger = winston.createLogger({
            format: winston.format.combine(
                format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                logFormat
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({
                    dirname: process.env.LOG_PATH,
                    filename: 'info.log',
                    level: 'info'
                }),
                new winston.transports.File({
                    dirname: process.env.LOG_PATH,
                    filename: 'error.log',
                    level: 'error'
                }),
                new winston.transports.File({
                    dirname: process.env.LOG_PATH,
                    filename: 'warn.log',
                    level: 'warn'
                })
            ]
        })
        this.logger = logger
    }
}

export const logger = CustomerLog.getInstance()
