/**
 * electron端的事件总线，通过$on来传递事件字符串，参数对象，
 * 用$emit来触发electron事件，像桌面端发送事件
 */

import { logger } from "@/electron/logger/init"

/**
 * 事件类型枚举类
 */
enum EventType{
    ON,
    ONCE
}
/**
 * 事件类型对象
 */
interface EventItem{
    name: string,
    fn: Function,
    type: EventType,
    thisArgs: object | undefined
}

interface $On{
    (name: string, fn: Function): void
    (name: string, fn: Function, thisArg: object): void
}

interface $Once{
    (name: string, fn: Function): void
    (name: string, fn: Function, thisArg: object): void
}

interface IEventBus{
    $on: $On
    $once: $Once
    $emit(name: string, ...args:any[]):void
}

export class EventBus implements IEventBus{

    private static instance: EventBus
    private eventMap = new Map<string, EventItem>()

    private constructor(){}

    public static getInstance(): EventBus{
        if (!this.instance){
            this.instance = new EventBus()
        }
        return this.instance
    }

    public $on(name: string, fn: Function, thisArg?: object){
        const fnThis= thisArg ? thisArg : undefined
        this.addEvent(name, fn, EventType.ON, fnThis)
    }

    public $once(name: string, fn: Function, thisArg?: object){
        const fnThis= thisArg ? thisArg : undefined
        this.addEvent(name, fn, EventType.ONCE, fnThis)
    }

    private addEvent(name: string, fn: Function, type: EventType, thisArgs?: object){
        if( name.split('::').length != 2) throw new Error('The command name is not standardized, the recommand format is (module)::(name)')
        const event: EventItem = {name, fn,type, thisArgs}
        this.eventMap.set(name, event)
    }
    
    public $emit(name: string, ...args:any[]){
        const event = this.eventMap.get(name)
        if(event){
            event.fn.apply(event.thisArgs, args)
            if(event.type == EventType.ONCE){
                this.eventMap.delete(name)
            }
        }
    }

}