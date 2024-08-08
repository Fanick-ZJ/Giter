// 这个文件用于记录详情界面图标的显示数据
import { Author, AuthorStatDailyContributeMap, StatDailyContribute, unknown } from '@/types'
import {defineStore} from 'pinia'
import { CurShowData } from '@/renderer/types'
type DetailChartStoreType = StatDailyContribute 
                            & Record<'curShowData', CurShowData> 
                            & Record<'authorMap', AuthorStatDailyContributeMap> 
                            & Record<'start', Date> 
                            & Record<'end', Date> 
                            & Record<'dateList', Array<Date>>

type authorMapItme = StatDailyContribute & Record<'author', Author> & Record<'key', string>
export const useDetailChartStore = defineStore('detailChartStore', {
    state: (): DetailChartStoreType => ({
        start: new Date(),
        end: new Date(),
        curShowData: 'commits',
        changeFiles: [] as number[],
        commitCount: [] as number[],
        deletions: [] as number[],
        insertion: [] as number[], 
        dateList: new Array<Date>(),
        authorMap: new Map<string, authorMapItme>()
    }),
    getters: {
        curDataList(): number[] {
            if (this.curShowData == 'commits') return this.commitCount
            else if (this.curShowData == 'deletions') return this.deletions
            else if (this.curShowData == 'insertions') return this.insertion
            else{
                unknown(this.curShowData)
            }
        }
    },
    actions: {
        curAuthorDataList(authorName: string): number[] {
            const author = this.authorMap.get(authorName)
            if(author){
                if (this.curShowData == 'commits') return author.commitCount
                else if (this.curShowData == 'deletions') return author.deletions
                else if (this.curShowData == 'insertions') return author.insertion
                else{
                    unknown(this.curShowData)
                }
            }
            return []
        },
        getUserDateList(authorName: string): Date[]{
            const author = this.authorMap.get(authorName)
            if (author) return author.dateList
            return []
        },
        clear(){
            this.start = new Date()
            this.end = new Date()
            this.curShowData = 'commits'
            this.changeFiles = new Array<number>()
            this.insertion = new Array<number>()
            this.deletions = new Array<number>()
            this.dateList = new Array<Date>()
            this.authorMap = new Map<string, authorMapItme>()
        }
    }
})