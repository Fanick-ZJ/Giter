import { getEnvironmentData } from 'worker_threads'
import _ from "lodash"
import { logger } from '@/electron/logger/init'

const BASE64_REPLACE_CHAR = '__REPLACE__'


export function abortWrapper(p1: Promise<any>) {
    let abort
    let p2 = new Promise((resolve, reject) => (abort = reject))
    let p = Promise.race([p1, p2])
    Reflect.defineProperty(p1, 'abort', p2)
    return p
}

export const encode = (str: string) => {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str))).replace('/', BASE64_REPLACE_CHAR)
}

export const decode = (str: string) => {
  if (!str) return ''
  return new TextDecoder().decode(Uint8Array.from(atob(str.replace(BASE64_REPLACE_CHAR, '/')), (c) => c.charCodeAt(0)))
}

/**
 * 列举函数的参数
 * @param func 函数体
 * @returns 返回参数列表
 */
export function getFunctionArguments(func: Function): string[] {
  // 获取函数的字符串表示，忽略函数体
  var funcStr = func.toString().split('{')[0].trim();
  
  // 使用正则表达式匹配参数
  var argsPattern = /\(([\s\S]*?)\)/;
  var matches = funcStr.match(argsPattern);
  
  if (matches && matches.length > 1) {
    // 去除空格和逗号，然后分割参数名
    return matches[1].replace(/\s*,\s*/g, ',').split(',');
  }
  
  return [];
}

export function zipWithObj(arr1: string[], arr2: any[]) {
  return _.zipObject(arr1, arr2)
}

export function workerThreadEnvInit() {
  const keys = Reflect.ownKeys(process.env)
  keys.forEach(key => {
    if (typeof key === 'string') {
      const value = getEnvironmentData(key) as string
      process.env[key] = value
    }
  })
} 