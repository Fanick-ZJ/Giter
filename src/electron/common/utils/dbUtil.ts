import { logger } from "@/electron/logger/init"
import Database from "better-sqlite3"

export const buildDbInstance = (path: string) =>  {
    const option: Database.Options = {
        readonly: false,
        fileMustExist: true,
        timeout: 2000,
        verbose: logger.info
    }
    try{
        return Database(path, option)
    }
    catch (error) {
        logger.info(error)
        return Database(path, option)
    }
}