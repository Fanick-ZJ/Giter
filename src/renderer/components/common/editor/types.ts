export type CustomEditorOptions = {
    fileName: string
    fileSize: number
    fileType: string
    fileContent: string
    readOnly: boolean
    objhash: string
    hideHandle: () => void
    teleport?: string
}