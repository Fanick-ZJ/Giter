import { Path } from "."

export class RepositoryError extends Error{
    repo: Path
    branch: string
    message: string

    constructor(repo: Path = "", branch: string = "", message: string){
        super(message)
        this.repo = repo
        this.branch = branch
        this.message = message
    }
}

export type ErrorPageInfo = {
    title: string
    content: string
}