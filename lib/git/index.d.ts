/* tslint:disable */
/* eslint-disable */

/* auto-generated by NAPI-RS */

export interface Author {
  name: string
  email: string
}
export const enum RepoStatus {
  UnCommit = 0,
  UnPush = 1,
  UnPull = 2,
  UnKnown = 3,
  Ok = 4
}
export interface BranchCreatedInfo {
  name: string
  time: string
  author: Author
  hash: string
}
export interface Branch {
  name: string
  created: BranchCreatedInfo
  authors: Array<Author>
}
export interface Remote {
  name: string
  url: string
  operate: Array<string>
}
export interface RepositoryFull {
  currentBranch: string
  branches: Array<string>
  authors: Array<Author>
  name: string
  remote: Array<Remote>
  path: string
}
export interface RepositorySimple {
  name: string
  path: string
  branches: Array<string>
  currentBranch: string
  remote: Array<Remote>
  authors: Array<Author>
}
/**
 * The statistic of daily contribute in a branch
*/
export interface StatDailyContribute {
  commitCount: Array<number>
  dateList: Array<string>
  insertion: Array<number>
  deletions: Array<number>
  changeFiles: Array<number>
}
export interface AuthorStatDailyContribute {
  author: Author
  stat: StatDailyContribute
}
export interface BranchStatDailyContribute {
  branch: string
  totalStat: StatDailyContribute
  authorsStat: Array<AuthorStatDailyContribute>
}
export interface RepoFileInfo {
  name: string
  dir: string
  objectMode: string
  objectType: string
  objectName: string
  objectSize: string
  isDir: boolean
  children: Array<RepoFileInfo>
}
export const enum FileStatusType {
  Added = 0,
  Deleted = 1,
  Modified = 2,
  Renamed = 3,
  Copied = 4,
  Updated = 5,
  Unknown = 6
}
export interface FileStatus {
  path: string
  status: FileStatusType
  message: string
}
export interface FileStatusReport {
  title: string
  hash: string
  time: string
  author: Author
  status: Array<FileStatus>
}
export interface FileDiffContext {
  commitHash1: string
  commitHash2: string
  filePath: string
  changeStat: FileLineChangeStat
  context1: string
  context2: string
  fileStatus: FileStatusType
}
export interface FileLineChangeStat {
  addition: number
  deletion: number
}
/**
 * Check if git is installed
*/
export declare function hasGit(): boolean
/**
 * Check if a path is a git repository
 * @param path path to the repository
*/
export declare function isGitRepository(path: string): boolean
/**
 * Get all branches in a git repository
 * @param path path to the repository
*/
export declare function getBranches(path: string): Array<string>
/**
 * Check if a git repository is commited
 * @param path path to the repository
*/
export declare function isCommited(path: string): boolean
/**
 * Check if a branch has been pushed
 * @param path path to the repository
 * @param branch branch name
*/
export declare function isPushed(path: string, branch: string): boolean
/**
 * Get the status of a repository
 * @param path path to the repository
*/
export declare function getStatus(path: string): RepoStatus
/**
 * Get the current branch name
 * @param path path to the repository
*/
export declare function getCurrentBranch(path: string): string
/**
 * Get the remote of a branch
 * @param path path to the repository
 * @param branch branch name
*/
export declare function getBranchInRemote(path: string, branch: string): string
/**
 * Check this repository has remote
 * @param path path to the repository
 */
export declare function hasRemote(path: string): boolean
/**
 * Get all remotes of a repository
 * @param path path to the repository
 */
export declare function getRemote(path: string): Array<Remote>
/**
 * Get all tags of a repository
 * @param path path to the repository
 */
export declare function getTags(path: string): Array<string>
/**
 * Get the commit log of a repository
 * You can use placeholders to get the commit log information.
 * The placeholders are:
 * | Placeholders | Description | key |
 * | ---- | ---- | ---- |
 * |%H    | commit hash| hashL |
 * |%h    | abbreviated commit hash| hashS |
 * |%T    | tree hash | treeL |
 * |%t    | abbreviated tree hash| treeS |
 * |%P    | parent hashes | parentHashL |
 * |%p    | abbreviated parent hashes | parentHashS |
 * |%an   | author name | authorName |
 * |%ae   | author email | authorEmail |
 * |%ad   | author date  | date |
 * |%ar   | author date, relative with now | dateRelative |
 * |%at   | author date, unix timestamp | dateTimeStamp |
 * |%ai   | author date, ISO 8601 format | dateIso |
 * |%as   | author date, short format (YYYY-MM-DD) | dateYMD |
 * |%ah   | author date, human-readable format | dateHuman |
 * |%cn   | committer name | committerName |
 * |%ce   | committer email | committerEmail |
 * |%cd   | committer date | committerDate |
 * |%cr   | committer date, relative with now | committerDateRelative |
 * |%ct   | committer date, unix timestamp | committerDateTimeStamp |
 * |%cs   | committer date, short format (YYYY-MM-DD) | committerDateYMD |
 * |%ch   | committer date, human-readable format | committerDateHuman |
 * |%d    | ref names | refs |
 * |%D    | ref names, separated by commas | refsComma |
 * |%s    | subject | message |
 * |%b    | body | body |
 * |%B    | body, without trailing slash | bodyNoTrailingSlash |
 * |%N    | commit notes | notes |
 *
 * @param path path to the repository
 * @param branch branch name
 * @param placeholders placeholders to get the commit log information
 * @param start_commit start commit hash, it can be ""
 * @param end_commit end commit hash, it can be ""
 * @return commit log
*/
export declare function getCommitLogFormat(path: string, placeholders: Array<string>, startCommit: string, endCommit: string): Array<Record<string, string>>
/**
 * Get the authors of a repository
 * @param path path to the repository
 * @param branch branch to get the authors from
 */
export declare function getBranchAuthors(path: string, branch: string): Array<Author>
/**
 * Get the authors of a repository
 * @param path path to the repository
 */
export declare function getAllAuthors(path: string): Array<Author>
/**
 * Get the branch creation info of a repository
 * @param path path to the repository
 * @param branch branch to get the branch creation info from
 */
export declare function getBranchCreateInfo(path: string, branch: string): BranchCreatedInfo
/**
 * Get the branch creation info of a repository
 * @param path path to the repository
 * @param branchs branchs to get the branch creation info from
 */
export declare function getBranchsCreateInfo(path: string, branchs: Array<string>): Array<BranchCreatedInfo>
/**
 * Get the repository info of a repository
 * @param path path to the repository
 */
export declare function getRepositoryInfoFull(path: string): RepositoryFull
/**
 * Get the repository info in a simple way
 * @param path path to the repository
*/
export declare function getRepositoryInfoSimple(path: string): RepositorySimple
/**
 * Get the statistic of daily contribute in a branch
*/
export declare function getContributeStat(path: string, branch: string): BranchStatDailyContribute
/**
 * Get the file list of a repository
*/
export declare function getRepoFileList(path: string, branchOrHash: string): Array<RepoFileInfo>
/**
 * Get the file status of a commit
*/
export declare function getCommitFileStatus(path: string, hash: string): FileStatusReport
/**
 * Get the file change statistic between two commits
 * @param path The path of the repository
 * @param commit_hash1 The commit hash of the first commit
 * @param commit_hash2 The commit hash of the second commit
 * @param file_path The path of the file
*/
export declare function getFileModifyStatBetweenCommit(path: string, commitHash1: string, commitHash2: string, filePath: string): FileLineChangeStat
/**
 * Get the files change status between two commits
 * @param path The path of the repository
 * @param commit_hash1 The commit hash of the first commit
 * @param commit_hash2 The commit hash of the second commit
*/
export declare function getFilesStatusBetweenCommit(path: string, commitHash1: string, commitHash2: string): Array<FileStatus>
/**
 * Get the file diff context of a file
 * @param repo: the path of the repository
 * @param commit_hash1: the hash of the first commit
 * @param commit_hash2: the hash of the second commit
 * @param file_path: the path of the file
*/
export declare function diffFileContext(repo: string, commitHash1: string, commitHash2: string, filePath: string): FileDiffContext
/**
 * get file content in a commit
 * @param repo repo path
 * @param commit_hash commit hash
 * @param file_path file path
*/
export declare function getFileContent(repo: string, commitHash: string, filePath: string): string
export declare function getFileByHash(repo: string, fileHash: string): string
/**
 * get difference file diff statistic between two commits
 * @param repo repo path
 * @param commit_hash1 commit hash1
 * @param commit_hash2 commit hash2
 * @param file_path1 file path in commit1
 * @param file_path2 file path in commit2
 * @returns FileDiffContext
*/
export declare function getDiffFileStatBetweenCommit(repo: string, commitHash1: string, commitHash2: string, filePath1: string, filePath2: string): FileLineChangeStat
/**
 * get difference files diff between two commits
 * @param repo repo path
 * @param commit_hash1 commit hash1
 * @param commit_hash2 commit hash2
 * @returns FileDiffContext
*/
export declare function getFilesDiffContext(repo: string, commitHash1: string, commitHash2: string): Array<FileDiffContext>
export declare function getCommitWithinBranches(repo: string, commitHash: string): Array<string>
export declare function getBranchCommitCount(path: string, branch: string): number
