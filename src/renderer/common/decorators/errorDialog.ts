import 'reflect-metadata'
/**
 * 关于ipc通信任务的注解
 */
export default function ErrorDialog(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
     let oldVal = descriptor.value!
     // logger.info(descriptor)
     descriptor.value = function (...args: any[]){
        let res = oldVal.apply(this, args)
        if (res instanceof Promise) {
            res.catch((err: any) => {
                if (err instanceof Error) {
                    console.log(err.message)
                    window.dialogAPI.showWarnDialog('error', err.message)
                }else {
                    return Promise.reject(err)
                }
            })
        }
        return res
    }
}