import {defineStore} from 'pinia'
import { AbstractRepoItem, RepoItem } from '@/types'
import { RepoStatus } from '@/types'
import { IpcRendererEvent } from 'electron'
import { listAssign } from '@/renderer/common/util/tools'
import { RepoTaskService } from '../../common/entity/repoTaskService';
/**
 * 在store中存储的仓库对象类型，因为有关于分支和存在性这种运行时才可之的数据，所以要与RepoItem分开
 */
export type RepoStoreItem = RepoItem & Record<'branches', string[]> & Record<'isExist', boolean>
export const useRepoStore = defineStore('Repos', {
    state: () => {
        return {
            list: [] as RepoStoreItem[],
            repoTaskService: new RepoTaskService(),
            curChosedRepo: null as RepoStoreItem | null
        }
    },
    actions: {
        add(repo:RepoStoreItem) {
            const index = this.list.findIndex(item => {
                if(item.path == repo.path){
                    return item
                }
            })
            if (index == -1) {
                this.list.push(repo)
            }
            this.sortRepoList()
        },
        update(repo: RepoStoreItem | RepoItem) {
            const index = this.list.findIndex(item => item.path == repo.path)
            if (index < 0) console.error("目标仓库不在仓库列表中")
            else listAssign(this.list[index], repo)
        },
        set(repoList: RepoStoreItem[]){
            this.list = repoList
            this.sortRepoList()
        },
        remove(repo:RepoStoreItem) {
            this.list = this.list.filter( item => item.path != repo.path)
        },
        /**
         * 界面点击仓库项选择仓库操作
         * @param item 
         */
        chooseRepos(item: RepoStoreItem){
            this.curChosedRepo = item
        },
        /**
        * 根据路径获取仓库对象
        * @param name 
        * @returns 
        */
       getRepoByPath(path: string){
           const repos = this.list.find(item => {
               if(item.path == path){
                   return item
               }
           })
           return repos
       },
       /**
       * 修改仓库的状态
       * @param item 
       * @param status 
       * @returns 
       */
        switchRepoStatus(item: AbstractRepoItem, status: RepoStatus){
            const repo = this.getRepoByPath(item.path)
            if(repo){
                repo.status = status
            } else {
                console.error("找不到目标仓库")
            }
        },
        /**
         * 接收切换仓库状态
         */
        receiveSwitchRepoStatus() {
            window.repoAPI.switchRepoStatus((event: IpcRendererEvent, param: {
                repos: AbstractRepoItem,
                status: RepoStatus
            }) => {
                const {repos, status} = param
                this.switchRepoStatus(repos, status)
            })
        },

        receiveUpdateRepoInfo() {
            window.repoAPI.receiveUpdateRepoInfo((event: IpcRendererEvent, repo: RepoItem) => {
                this.update(repo)
            })
        },
      /**
       * 添加新仓库
       */
        renderAddRepo () {
            window.repoAPI.renderAddRepo((event: IpcRendererEvent, repo: AbstractRepoItem) => {
                const ret = this.repoTaskService.getBranches(repo.path)
                ret.then(branches => {
                    this.add({
                        ...repo,
                        avatar: '',
                        status: RepoStatus.UNKNOW,
                        curBranch: '',
                        branches,
                        isExist: true
                    })
                })
            })
        },
        sortRepoList(){
            this.list.sort((a, b) => {
                if(a.isTop && !b.isTop){
                    return -1
                }else if(!a.isTop && b.isTop){
                    return 1
                }else{
                    return 0
                }
            })
        },
        // 获取所有仓库列表
        getAllRepos() {
            this.repoTaskService.getAllRepos().then(repos => {
                repos.forEach(item => {
                    this.repoTaskService.isLocalRepoExist(item.path)
                    .then(async (exist) =>{
                        let branches = [] as string[]
                        if (exist) {
                            branches = await this.repoTaskService.getBranches(item.path)
                        }
                        Reflect.defineProperty(item, 'branches', {
                            value: branches,
                            configurable: true
                        })
                        Reflect.defineProperty(item, 'isExist', {
                            value: exist,
                            configurable: true
                        })
                    })
                    .then(async () => {
                        if ((item as RepoStoreItem).isExist){
                            const path = await this.repoTaskService.getCurrentBranch(item.path)
                            item.curBranch = path
                        }
                        this.add(item as RepoStoreItem)
                    })
                })
            })
        }
    }
})