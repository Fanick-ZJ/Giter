import { app } from 'electron';
import { setEnvironmentData } from 'worker_threads'
import path from 'path'
export const initEnv = () => {
    process.env.DB_PATH = path.join(path.dirname(app.getAppPath()), 'data', 'config.db')
    process.env.LOG_PATH = path.join(path.dirname(app.getAppPath()), 'logs')
    process.env.TMP_PATH = path.join(path.dirname(app.getAppPath()), 'cache', 'tmp')
    
    const keys = Reflect.ownKeys(process.env)
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (typeof key === 'string') {
            setEnvironmentData(key, process.env[key] as string)
        }
    }
}

initEnv()