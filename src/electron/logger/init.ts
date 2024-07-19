import { app } from "electron"
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

export const init = () => {
    // 定义日志配置
    
    app.on('ready', async () => {
        // 渲染进程崩溃
        app.on('renderer-process-crashed', (event, webContents, killed) => {
            logger.error(
            `APP-ERROR:renderer-process-crashed; event: ${JSON.stringify(event)}; webContents:${JSON.stringify(
                webContents
            )}; killed:${JSON.stringify(killed)}`
            )
        })

        // GPU进程崩溃
        app.on('gpu-process-crashed', (event, killed) => {
            logger.error(`APP-ERROR:gpu-process-crashed; event: ${JSON.stringify(event)}; killed: ${JSON.stringify(killed)}`)
        })

        // 渲染进程结束
        app.on('render-process-gone', async (event, webContents, details) => {
            logger.error(
            `APP-ERROR:render-process-gone; event: ${JSON.stringify(event)}; webContents:${JSON.stringify(
                webContents
            )}; details:${JSON.stringify(details)}`
            )
        })

        // 子进程结束
        app.on('child-process-gone', async (event, details) => {
            logger.error(`APP-ERROR:child-process-gone; event: ${JSON.stringify(event)}; details:${JSON.stringify(details)}`)
        })
    })
}