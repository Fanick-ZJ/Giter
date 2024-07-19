import { buildDbInstance } from "../common/utils/dbUtil";

export class BaseDB {
    protected db = buildDbInstance(process.env.DB_PATH)
}