import { Worker, setEnvironmentData } from 'worker_threads'
import os from 'os'

type WorkersById = {
    [workerId: number]: Worker
} 

type ActiveWorkerById = {
    [workerId: number]: boolean
}

type TaskObj = {
    data: any
    cb: (error: any, result?: any) => void
}
// 获取当前设备的CPU线程数目，作为numberOfThreads的默认值
const {length: cpusLength} = os.cpus()

export class WorkPool {
    workerPath: string
    numberOfThreads: number
    _queue: any[]
    _workersById: WorkersById
    _activeWorkersById: ActiveWorkerById
    constructor(workerPath: string, numberOfThreads = cpusLength){
        if (numberOfThreads < 1) {
            throw new Error('Number of threads should be greater or equal than 1!')
        }
        this.workerPath = workerPath
        this.numberOfThreads = numberOfThreads

        // 任务队列
        this._queue = []
        //  worker 索引
        this._workersById = {}
        // worker激活状态索引
        this._activeWorkersById = {}

        // 创建Workers
        for (let i = 0 ; i < this.numberOfThreads; i++) {
            const worker = new Worker(workerPath)
            this._workersById[i] = worker
            // 将这些Worker设置为未激活状态
            this._activeWorkersById[i] = false
        }
    }

    // 获取一个未激活的workerId
    getInactiveWorkerId() {
        for (let i = 0; i < this.numberOfThreads; i++) {
            if (!this._activeWorkersById[i]) return i
        }
        return -1
    }

    /**
     * 调度Worker执行,目的是在指定的Worker里面执行指定的任务
     * @param workerId 
     * @param taskObj 
     */
    runWorker(workerId: number, taskObj: TaskObj){
        const worker = this._workersById[workerId]

        // 当前任务执行完毕后执行
        const doAfterTaskIsFinished = () => {
            // 去除所有的Listener,不然一次次添加不同的Listener会OOM的
            worker.removeAllListeners('message')
            worker.removeAllListeners('error')
            // 将这个Worker设为未激活状态
            this._activeWorkersById[workerId] = false

            if (this._queue.length) {
                // 任务队列为空,使用该Worker执行任务队列中的第一个任务
                this.runWorker(workerId, this._queue.shift())
            }
        }
        
        // 将这个Worker设为激活状态
        this._activeWorkersById[workerId] = true
        // 设置两个回调,用于Worker的监听
        const messageCallback = (result: any) => {
            taskObj.cb(null, result)
            doAfterTaskIsFinished()
        }
        const errorCallback = (error: any) => {
            taskObj.cb(error)
            doAfterTaskIsFinished()
        }
        
        // 为worker添加'message' 和 'error'两个Listener
        worker.once('message', messageCallback)
        worker.once('error', errorCallback)
        // 将数据传给Worker供其执行和获取
        worker.postMessage(taskObj.data)
    }

    run(data: any) {
        return new Promise((resolve, reject) => {
            // 调用getInactivceWorkerId() 获取一个空闲的Worker
            const availableWorkerId = this.getInactiveWorkerId()

            const taskObj: TaskObj = {
                data,
                cb: (error: any, result?: any) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            }
             if (availableWorkerId === -1){
                // 当前没有空闲的Worker,将任务加入任务队列,这样,一旦有Workers空闲机会执行
                this._queue.push(taskObj)
                return null
             }

            //  有一个空闲的Worker, 使用该Worker执行任务
            this.runWorker(availableWorkerId, taskObj)
        })
    }

    destory(force = false) {
        for (let i = 0 ; i < this.numberOfThreads; i++) {
            if (this._activeWorkersById[i] && !force) {
                // 通常情况下,不应该在还有Worker执行的时候就销毁他,这一定是什么地方出了问题，所以还是抛个 Error 比较好
                throw new Error(`The worker ${i} is still runing!`);
            }

            // 销毁Worker
            this._workersById[i].terminate()
        }
    }
}