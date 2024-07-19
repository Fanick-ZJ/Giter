import { RepoItem, RepoStatus } from '@/types'
//要在初始化的过程中就建好所需数据库
/*
onsuccess：数据库打开成功或者创建成功后的回调。
onerror：数据库打开或创建失败后的回调。
onupgradeneeded：当数据库版本有变化时的回调。经测试，chrome 浏览器将在初次创建该数据库时触发此事件，
后续需要触发此事件必须手动更新数据库版本。并且创建存储库**createStore**的操作必须在此事件触发的回调
中执行（在onsuccess中执行会报错），意味着要在应用中使用 IndexDB 建议在初始化过程中就创建好应用所需的
存储库。

链接：https://juejin.cn/post/7163839445375025189
 */
interface StoreItem{
    name: string,
    keyPathOptions: IDBObjectStoreParameters,   // 主键索引
    indexList?:{    // 其他的索引
        name: string,
        options?: IDBIndexParameters
    }[]
}

const stores:StoreItem[] = [
    {
        name: 'repository',
        keyPathOptions: {
            keyPath: 'path',
            autoIncrement: false
        },
        indexList: [
            {
                name: 'name',
                options:{
                    unique: true,
                    multiEntry: false
                }
            }
        ]
    },
    {
        name: 'openWith',
        keyPathOptions: {
            keyPath: 'path',
            autoIncrement: false
        },
        indexList: [
            {
                name: 'name',
                options:{
                    unique: true,
                    multiEntry: false
                }
            }
        ]
    }
]

function reqDBFn(databseName: string, version: number | undefined){
    const timeout = 3000
    // 初始化 打开数据库请求
    let reqOpenDB: IDBOpenDBRequest | null;
    return (): Promise<IDBDatabase> => 
        new Promise((resolve, reject) => {
            // 当reqOpenDB == null时执行
            if (!reqOpenDB) reqOpenDB = window.indexedDB.open(databseName, version)
            reqOpenDB.onerror = (event) => {
                window.globalAPI.logRecoder('Database', 'error',  `打开数据库${databseName}失败，数据库版本号为${version}`)
                window.globalAPI.logRecoder( 'Database', 'error',  '失败原因为：'+(event.target as IDBOpenDBRequest).error)
                reqOpenDB = null
                reject((event.target as IDBOpenDBRequest).error)
            }
            reqOpenDB.onsuccess = (event) => {
                const db = (event.currentTarget as IDBOpenDBRequest).result
                window.globalAPI.logRecoder( 'Database', 'info',  `打开数据库${databseName}成功，数据库版本为${version}`)
                reqOpenDB = null
                resolve(db)
            }
            reqOpenDB.onupgradeneeded = (event) => {
                console.log('触发了onupgradeneeded')
                const db = (event.currentTarget as IDBOpenDBRequest).result
                reqOpenDB = null
                createAllStore(db)
                setTimeout(() => {
                    resolve(db)
                }, timeout * 1 / 2)
                window.globalAPI.logRecoder( 'Database', 'info', `新建${databseName}，版本为${version}`)
            }
            setTimeout( () => {
                if (reqOpenDB == null) {
                    reqOpenDB = null
                    reject('Request IndexedDB Timeout!')
                }
            }, timeout)
        })
}

/**
 * 执行获取数据库请求对象的入口方法
 * @param databseName 
 * @param version 
 * @returns 
 */
export const reqDB = (databseName: string, version: number | undefined): Promise<IDBDatabase> => {
    const res = reqDBFn(databseName, version)()
    return res
}

/**
 * 建立单个store
 * @param db 
 * @param storeItem 
 * @returns 
 */
export const createStore = (
    db: IDBDatabase,
    storeItem: StoreItem
) => {
    // 必须在 onsuccess 和 onupgradeneeded 中执行创建方法
    if (db.objectStoreNames.contains(storeItem.name)) return false
    // 新建store并设置主键索引
    console.log(storeItem.name, storeItem.keyPathOptions)
    const store = db.createObjectStore(storeItem.name, storeItem.keyPathOptions)
    // 建立额外的索引
    storeItem.indexList?.forEach(({name, options}) => {
        store.createIndex(name, name, options)
    })
    return store
}

/**
 * 建立全部的store
 * @param db 
 */
const createAllStore = (db: IDBDatabase) => {
    stores.forEach( element => {
        createStore(db, element)
    });
}

/**
 * 获取store对象，在已经获取了db对象的情况下
 * @param db 数据库的IDBDatabase对象
 * @param storeName store的名字
 * @param mode 对store操作的模式
 * @returns 返回store对象
 */
export const getStore = (
    db: IDBDatabase,
    storeName: string[],
    mode: IDBTransactionMode
) => {
    let tx: IDBTransaction
    try{
        // 开启事务
        tx = db.transaction(storeName, mode)
    }catch(error){
        window.globalAPI.logRecoder( 'Database', 'error',  `[IndexDB] Store named ${storeName} cannot be found in the database`)
        throw new Error(
            `[IndexDB] Store named ${storeName} cannot be found in the database`
        );
    }
    return tx.objectStore(storeName[0])
}

/**
 * 获取store对象，在没有store对象的情况下
 * @param databseName 数据库名字列表，事务希望跨越的对象存储空间的列表，第一个为返回的store
 * @param version 数据库版本
 * @param storeName store名字
 * @returns 
 */
export const getStoreObject = (
    storeName: string[],
    databseName: string = 'giter',
    version: number | undefined = import.meta.env.VITE_DB_VERSION, 
):Promise<IDBObjectStore> => {
    return new Promise(async (resolve, reject) =>  {
        try{
            // 请求数据库，没有就新建
            let db = await reqDB(databseName, version)
            const store = getStore(db, storeName, 'readwrite')
            resolve(store)
        }catch(error){
            window.globalAPI.logRecoder( 'Database', 'error',  (error as Error).message)
            reject(`打开数据库${databseName}失败：${error}`)
        }
    })
}

/**
 * 删除store
 * @param db 数据库名字 
 * @param storeName store名字
 * @returns 
 */
export const deletStore = (db: IDBDatabase, storeName: string): Boolean => {
    if (!db.objectStoreNames.contains(storeName)){
        window.globalAPI.logRecoder( 'Database', 'error',  `删除store${storeName}失败`)
        return false
    }
    db.deleteObjectStore(storeName)
    window.globalAPI.logRecoder( 'Database', 'info',  `删除store${storeName}成功`)
    return true
}

/**
 * 增加记录
 * @param store 
 * @param data 
 */
export const add = (store: IDBObjectStore, data: any) => {
    new Promise((resolve, reject) => {
        const req = store.add(data)
        req.onsuccess = resolve
        req.onerror = reject
    })
}

// 改
export const put = (store: IDBObjectStore, data: any) =>{
    new Promise((resolve, reject) => {
        const req = store.put(data);
        req.onsuccess = resolve;
        req.onerror = reject;
    })
}

/**
 * 根据主键删除数据
 * @param store 
 * @param keyPathValue 
 */
export const remove = (
    store: IDBObjectStore,
    keyPathValue: IDBValidKey | IDBKeyRange
) =>{
    return new Promise((resolve, reject) => {
        const req = store.delete(keyPathValue);
        req.onsuccess = (evt) => {
            resolve((evt.target as IDBRequest).result);
        };
        req.onerror = reject;
    });
}

/**
 * 根据逐渐查找
 * @param store 
 * @param keyPathValue 
 * @returns 
 */
export const get = (
    store: IDBObjectStore,
    keyPathValue?: IDBValidKey | IDBKeyRange
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const req = keyPathValue ? store.get(keyPathValue) : store.getAll()
        req.onsuccess = (evt) => {
            const res = (evt.target as IDBRequest).result
            resolve(res)
        }
        req.onerror = reject
    })
}
