export type CustomEditorOptions = {
    fileName: string
    fileSize: number
    fileType: string
    fileContent: string
    readOnly: boolean
    objectName: string
    hideHandle: () => void
    teleport?: string
}