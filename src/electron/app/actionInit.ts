/**
 * 这个文件中注册IPC相关的事件
 */
import { WindowsManager } from "../win/windowManager";
import { RepoService } from "../service/entity/repoService";
import { DialogService } from "../service/entity/dialogService";
import { ExplorerService } from "../service/entity/explorerService";
import { LogService } from "../service/entity/logService";
import { enumControllerMethods } from "../common/utils/ipcUtil";
import { TaskService } from "../service/entity/taskService";
import { ConfigService } from "../service/entity/configService";
export const actionInit = (wm: WindowsManager) => {
    // global_init_on(wm.getMain()) // 注册全局事件
    // respoRenderOn() // 关于仓库的方法
    // 向IPC注册事件
    const repoService = new RepoService()
    const dialogSevice = new DialogService(wm.getMain())
    const explorerService = new ExplorerService(wm.getMain())
    const logService = new LogService()
    const taskService = new TaskService()
    const configService = new ConfigService()
    enumControllerMethods(repoService)
    enumControllerMethods(dialogSevice)
    enumControllerMethods(explorerService)
    enumControllerMethods(logService)
    enumControllerMethods(taskService)
    enumControllerMethods(configService)
}
