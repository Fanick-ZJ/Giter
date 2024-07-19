import {useRepoStore} from '@/renderer/store/modules/repository'
import { remoteRepoSiteIcon } from '@/renderer/types'
import { AbstractRepoItem, Author, RepoItem, RepoStatus } from '@/types'
import { IpcRendererEvent } from 'electron'
import { generateFromString } from 'generate-avatar'
import { add as dbAdd, get, getStoreObject, put, remove } from './dbUtil'

export const getAvatar = (name: string, email: string, width: Number = 70, height: Number = 70, className?: string) => {
    let item = generateFromString(name + email).replace("width=\"300\"", `width=\"${width}\"`).replace("height=\"300\"", `height=\"${height}\"`)
    if (className){
        item = item.replace('<svg', `<svg class=${className}`)
    }
    return item
}

export const getRemoteSiteIcon = (path: string): remoteRepoSiteIcon => {
    const match = path.match(/[^https?://]([^.]*)[^.]/)
    if (match){
        const site = match[0]
        if (site == 'github') return 'mdi:github'
        if (site == 'gitee') return 'simple-icons:gitee'
    }
    return undefined
}
