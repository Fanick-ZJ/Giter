export const basename = (path: string): string => {
    path = path.replaceAll('\\', '/');
    return path.split('/').pop() || '';
}

export const getExt = (path: string): string => {
    const ext = basename(path).split('.').pop();
    return ext || '';
}

export const build_path = (...args: string[]) => {
  return args.map((part, i) => {
    if (i === 0) {
      return part.trim().replace(/[\/]*$/g, '')
    } else {
      return part.trim().replace(/(^[\/]*|[\/]*$)/g, '')
    }
  }).filter(x=>x.length).join('/')
}
export const getIconByExt = (file: string): string => {
  const ext = getExt(file)
  if (ext == 'py') return 'logos:python'
  if (ext == 'md') return 'skill-icons:markdown-light'
  if (ext == 'js') return  'fa6-brands:square-js'
  if (ext == 'jsx') return 'file-icons:jsx-alt'
  if (ext == 'tsx') return 'file-icons:tsx-alt'
  if (ext == 'css') return 'bi:filetype-css'
  if (ext == 'ts') return 'fluent:document-ts-16-filled'
  if (ext == 'scss') return 'vscode-icons:file-type-scss2'
  if (ext == 'less') return 'skill-icons:less-dark'
  if (ext == 'gitignore') return 'simple-icons:gitignoredotio'
  if (ext == 'vue') return 'logos:vue'
  if (ext == 'yarn') return 'devicon:yarn'
  if (ext == 'json') return 'vscode-icons:file-type-light-json'
  if (ext == 'env') return 'mdi:gear'
  if (ext == 'svg') return 'openmoji:svg'
  if (ext == 'jpg') return 'bxs:file-jpg'
  if (ext == 'png') return 'bxs:file-png'
  if (ext == 'bmp') return 'bi:filetype-bmp'
  if (ext == 'html') return 'ic:outline-html'
  if (ext == 'java') return 'bi:filetype-java'
  if (ext == 'rust') return 'simple-icons:rust'
  if (ext == 'c') return 'mdi:language-c"'
  if (ext == 'cpp') return 'simple-icons:cplusplus'
  if (ext == 'cs') return 'devicon-plain:csharp'
  if (ext == 'yml' || ext == 'yaml') return 'vscode-icons:file-type-light-yaml'
  if (ext == 'go') return 'logos:go'
  return 'bxs:file-txt'
}


const fileTypes: { [key: string]: string } = {
  'txt': 'plaintext',
  'abap': 'abap',
  'apex': 'apex',
  'azcli': 'azcli',
  'bat': 'bat',
  'bicep': 'bicep',
  'cameligo': 'cameligo',
  'clojure': 'clojure',
  'coffee': 'coffeescript',
  'c': 'c',
  'cpp': 'cpp',
  'cs': 'csharp',
  'csp': 'csp',
  'css': 'css',
  'cypher': 'cypher',
  'dart': 'dart',
  'dockerfile': 'dockerfile',
  'ecl': 'ecl',
  'ex': 'elixir',
  'flow': 'flow9',
  'fs': 'fsharp',
  'go': 'go',
  'graphql': 'graphql',
  'hbs': 'handlebars',
  'hcl': 'hcl',
  'html': 'html',
  'ini': 'ini',
  'java': 'java',
  'js': 'javascript',
  'jl': 'julia',
  'kt': 'kotlin',
  'less': 'less',
  'lex': 'lexon',
  'lua': 'lua',
  'liquid': 'liquid',
  'm3': 'm3',
  'md': 'markdown',
  'mdx': 'mdx',
  'mips': 'mips',
  'dax': 'msdax',
  'sql': 'mysql',
  'm': 'objective-c',
  'pas': 'pascal',
  'ligo': 'pascaligo',
  'pl': 'perl',
  'pgsql': 'pgsql',
  'php': 'php',
  'ats': 'postiats',
  'pq': 'powerquery',
  'ps1': 'powershell',
  'pug': 'pug',
  'py': 'python',
  'r': 'r',
  'cshtml': 'razor',
  'redis': 'redis',
  'rs': 'redshift',
  'rst': 'restructuredtext',
  'rb': 'ruby',
  'sb': 'sb',
  'scala': 'scala',
  'scm': 'scheme',
  'scss': 'scss',
  'sh': 'shell',
  'sol': 'sol',
  'st': 'st',
  'swift': 'swift',
  'tcl': 'tcl',
  'twig': 'twig',
  'ts': 'typescript',
  'vb': 'vb',
  'xml': 'xml',
  'yaml': 'yaml'
};

// 根据文件扩展名获取文件类型
export function getFileType(filePath: string): string {
  const extension = getExt(filePath);
  return fileTypes[extension]
}