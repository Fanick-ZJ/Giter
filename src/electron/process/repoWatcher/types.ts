import { AbstractRepoItem, RepoStatus } from "@/types"
import { MessageData } from "../type"

export type RecvMsgTag = 'watch' | 'unwatch' | 'close'

export type RecvMsg = MessageData<RecvMsgTag, AbstractRepoItem>

export type SendMsgTag = 'change' | 'error' | 'watched' | 'unwatched'


export type SendMsgBody = {
    repos: AbstractRepoItem
    status: RepoStatus
}

export type SendMsg = MessageData<SendMsgTag, SendMsgBody>