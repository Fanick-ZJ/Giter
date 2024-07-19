// &：表示交叉类型，两个类型的属性做合集
// Omit: 表示缺省，扔掉T类型中的K属性
// Pick：生成一个类型，里面之后T类型中的K属性
// Partial： 将T类型中的所有部分都变成可选择
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>


export type GetFileListOption = {
    // 是否递归枚举
    recursive?: boolean
    // 忽略文件名
    ignoreFile?: string[]
    // 忽略文件夹
    ignoreDir?: string[]
    // 忽略的文件类型 以".xxx" 结尾
    ignoreType?: string[]
    // 是否同步运行，默认异步
    sync?: boolean
}

export type FileInfo = {
    name: string
    path: string
    extension: string
    size: number
    modified: Date
    isFolder?: boolean
    children?: FileInfo[]
}

export type FileTypeMap = { [extension: string]: string };


export const TextFileTypeMap: FileTypeMap = {
    'js': 'javaScript',
    'jsx': 'jSX',
    'ts': 'typeScript',
    'tsx': 'typeScript (with JSX)',
    'java': 'java',
    'py': 'python',
    'rb': 'ruby',
    'php': 'php',
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'h': 'cpp',
    'hpp': 'cpp',
    'cs': 'c#',
    'swift': 'swift',
    'go': 'go',
    'rs': 'rust',
    'pl': 'perl',
    'lua': 'lua',
    'sh': 'shell',
    'bat': 'batch',
    'ps1': 'powershell',
    'dart': 'dart',
    'kt': 'kotlin',
    'groovy': 'groovy',
    'sql': 'sql',
    'r': 'r',
    'scala': 'scale',
    'erl': 'rrlang',
    'hs': 'haskell',
    'gradle': 'gradle',
    'xml': 'xml',
    'xsd': 'xsd',
    'xslt': 'xslt',
    'yaml': 'yaml',
    'yml': 'yaml',

    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'less': 'less',
    'sass': 'sass',
    'scss': 'scss',
    'json': 'json',
    'md': 'markdown',
};