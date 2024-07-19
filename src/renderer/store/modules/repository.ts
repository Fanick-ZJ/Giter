import {defineStore} from 'pinia'
import { AbstractRepoItem, Branchs, AuthorStatDailyContributeMap, RepoItem, StatDailyContribute } from '@/types'
import {add, get, getStoreObject, put, remove} from '@/renderer/common/util/dbUtil'
import { toRaw } from 'vue'
import { RepoStatus } from '@/types'
import { IpcRendererEvent } from 'electron'
import { RepoTaskService } from '@/renderer/common/entity/repoTaskService'
import { listAssign } from '@/renderer/common/util/tools'

export const useRepoStore = defineStore('Repos', {
    state: () => ({
        list: new Array<RepoItem>(),
        currChosedRepo: {
            path: '',
            name: '',
            watchable: false,
            isTop: false,
            isHidden: false,
            isExist: false,
            avatar: '',
            status: RepoStatus.UNKNOW,
            curBranch: ''
        } as RepoItem
    }),
    actions: {
        add(repo:RepoItem) {
            const index = this.list.findIndex(item => {
                if(item.path == repo.path){
                    return item
                }
            })
            if (index == -1) {
                this.list.push(repo)
            }else{
                listAssign(this.list[index], repo)
            }
            this.sortRepoList()
        },
        set(repoList: RepoItem[]){
            this.list = repoList
            this.sortRepoList()
        },
        remove(repo:RepoItem) {
            this.list = this.list.filter( item => item.path != repo.path)
        },
        /**
         * 界面点击仓库项选择仓库操作
         * @param item 
         */
        chooseRepos(item: RepoItem){
            this.currChosedRepo = item
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
            for(let i = 0 ; i < this.list.length ; i++){
                if (item.path == this.list[i].path){
                    this.list[i].status = status
                    return
                }
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
                this.add(repo)
            })
        },
      /**
       * 添加新仓库
       */
        renderAddRepo () {
            window.repoAPI.renderAddRepo((event: IpcRendererEvent, repo: AbstractRepoItem) => {
                this.add({
                    ...repo,
                    avatar: '',
                    status: RepoStatus.UNKNOW,
                    curBranch: ''
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
    }
})