import { Worker, WorkerOptions, setEnvironmentData } from 'worker_threads';
import { logger } from "@/electron/logger/init";
import path from "path";
import { WorkPool } from './WorkPool';
export function newWorker(threadName: string,options: WorkerOptions = {}) {
    const threadFile = path.join(__dirname, 'workers', `${threadName}.js`)
    return new Promise((resolve, reject) => {
        const worker = new Worker(threadFile, {
            ...options
        })
        worker.on('message', resolve)
        worker.on('error', reject)
    })
}

// 初始化自动创建的线程池列表
const workerList = [
    'repos'
]

export class WorkerThreadPoolMap {
    private poolMap = new Map<string, WorkPool>()
    private static instance: WorkerThreadPoolMap
    private constructor(){
        for (let i = 0; i < workerList.length; i++) {
            const workerName = workerList[i]
            const workerFile = path.join(__dirname, 'workers', `${workerName}.js`)
            this.poolMap.set(workerName, new WorkPool(workerFile))
        }
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new WorkerThreadPoolMap()
        }
        return this.instance
    }
    addWorkerPool(workerPath: string, workerName: string, cpus: number = 1){
        const pool = this.poolMap.get(workerName)
        if (pool) {
            throw new Error(`threadName:${workerName} is exist!`)
        }
        this.poolMap.set(workerName, new WorkPool(workerPath, cpus))
    }

    run(workerName: string, data: any) {
        const pool = this.poolMap.get(workerName)
        if (!pool) {
            throw new Error(`threadName:${workerName} is not exist!`)
        }
        return pool.run(data)
    }

    removeWorkerPool(workerName: string) {
        const pool = this.poolMap.get(workerName)
        if (!pool) {
            throw new Error(`threadName:${workerName} is not exist!`)
        }
        pool.destory()
        this.poolMap.delete(workerName)
    }
}
