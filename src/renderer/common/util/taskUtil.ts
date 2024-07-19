import { uuid } from "./tools"

type taskReturn<T> = {
    taskID: TaskID
    res: T
}

export const buildTask = <T extends (...args: any[]) => any>
(func: T,...args: Parameters<T>): taskReturn<ReturnType<T>> =>{
    const taskID = uuid()
    args.push(taskID)
    return {
        taskID,
        res: func.call(args)
    }
}