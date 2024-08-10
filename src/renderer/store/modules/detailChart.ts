// 这个文件用于记录详情界面图标的显示数据
import {defineStore} from 'pinia'
import { CurShowData } from '@/renderer/types'
import { AuthorStatDailyContribute, StatDailyContribute } from 'lib/git'
type DetailChartStoreType = StatDailyContribute
                            & Record<'curShowData', CurShowData> 
                            & Record<'authorMap', AuthorStatDailyContribute[]> 
                            & Record<'start', Date> 
                            & Record<'end', Date> 

export const useDetailChartStore = defineStore('detailChartStore', {
    state: (): DetailChartStoreType => ({
        start: new Date(),
        end: new Date(),
        curShowData: 'commits',
        changeFiles: [] as number[],
        commitCount: [] as number[],
        deletions: [] as number[],
        insertion: [] as number[], 
        dateList: new Array<string>(),
        authorMap: new Array<AuthorStatDailyContribute>()
    }),
    getters: {
        curDataList(): number[] {
            if (this.curShowData == 'commits') return this.commitCount
            else if (this.curShowData == 'deletions') return this.deletions
            else if (this.curShowData == 'insertions') return this.insertion
            else return []
        }
    },
    actions: {
        curAuthorDataList(authorName: string): number[] {
            const author = this.authorMap.find(item => item.author.name == authorName)
            if(author){
                if (this.curShowData == 'commits') return author.stat.commitCount
                else if (this.curShowData == 'deletions') return author.stat.deletions
                else if (this.curShowData == 'insertions') return author.stat.insertion
            }
            return []
        },
        getUserDateList(authorName: string): Date[]{
            const author = this.authorMap.find(item => item.author.name == authorName)
            if (author) return author.stat.dateList.map(item => new Date(item))
            return []
        },
        clear(){
            this.start = new Date()
            this.end = new Date()
            this.curShowData = 'commits'
            this.changeFiles = new Array<number>()
            this.insertion = new Array<number>()
            this.deletions = new Array<number>()
            this.dateList = new Array<string>()
            this.authorMap = new Array<AuthorStatDailyContribute>()
        }
    }
})