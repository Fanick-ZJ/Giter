import { onUnmounted } from "vue";
import { isSetupEnvironment, uuid } from "../util/tools"
import { apiMap } from "../util/apiUtil";
/**
 * 这个类的主要目的是实现对主进程的promise函数进行中断操作，因为
 * 有些时候在执行一些相对费时的操作时，在此期间切换界面不会时原有的
 * promise函数中断，仍然会继续执行，所以需要有一个类对所有任务进行
 * 统一管理，实现对任务的中断操作。是单例模式
 * 
 * 
 */
export class IpcRendererBasicTaskService{
    private taskTagMap = new Map<string, Function>;
    /**
     * 执行任务
     * @param func 任务函数
     * @param param 任务参数
     * @returns 
     */
    constructor() {
        // 监听页面卸载事件，中断所有任务
        isSetupEnvironment() && onUnmounted(() => {
            this.interrupt()
        })
    }
    invoke<T extends (...args: any[]) => any>(func:T, ...args: Parameters<T>):ReturnType<T> {
        const taskId = uuid();// 为每个任务生成一个uuid
        this.taskTagMap.set(taskId, func);      // 设立id->task的映射关系
        // console.log("执行任务", apiMap.get(func), args, taskId)
        args.push(taskId)
        const t1 = new Date()
        let fn_ret = func(...args);     // 执行任务
        if (fn_ret instanceof Promise){
            fn_ret = fn_ret.then(res => {
                const t2 = new Date()
                console.log(`任务${apiMap.get(func)}执行时间, ${args}`, t2.getTime() - t1.getTime())
                if(this.taskTagMap.has(taskId)){
                    this.taskTagMap.delete(taskId)
                    return Promise.resolve(res)
                }else{
                    console.log('任务已删除但仍然返回')
                    return new Promise(() => {})
                }
            }, error => {
                if (this.taskTagMap.has(taskId)){
                    console.log('返回错误', error)
                    return Promise.reject(error)
                }else{
                    console.log('任务已删除但仍然返回')
                    return new Promise(() => {})
                }
            })
        }else{
            this.taskTagMap.delete(taskId)
        }
        return fn_ret;
    }
    
    interrupt(taskId ?: TaskID | Array<TaskID>){
        // 如果传入指定的id，就消除指定的任务
        if (taskId){
            console.log('清除部分', taskId)
            window.taskAPI.clear(taskId);
        }
        // 没有的话就全部消除
        console.log('清除全部', Array.from(this.taskTagMap.keys()))
        if (process.env.NODE_ENV === 'development') {
            Array.from(this.taskTagMap.values()).forEach(element => {
                console.log(apiMap.get(element))
            });
        }
        window.taskAPI.clear(Array.from(this.taskTagMap.keys()))
        this.taskTagMap.clear()
    }
}