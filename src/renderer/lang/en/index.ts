export default {
    _: '',
    statusbar: {
        uncommit: "haven't commit",
        unpush: "haven't push",
    },
    commitGraph: {
        current_branch: "Branch",
        affected_branch: 'Affected branches',
        filter: 'Filter'
    },
    commitFilter: {
        time: "Time",
        author: "Author",
        message: "Message",
        search: "Search",
        cancel: "Cancel",
    },
    menu: {
        del: 'Delete',
        import: 'Import' 
    },
    RepoItemContextMenu: {
        add: 'Add',
        openDir: 'Reveal in Explorer',
        edit: 'Edit',
        del: 'Delete',
        detail: 'Repository Details',
        openProject: 'Open Project',
        more: 'More',
        fileView: 'File View'
    },
    commitDetailItemContextMenu: {
        viewThisCommit: 'View this commit',
        viewThisCommitFileTree: 'View this commit tree',
    },
    detailPage: {
        commitCount: 'Commits',
        branchCount: 'Branchs',
        tagCount: 'Tags',
        contributors: 'Contributors'
    },
    dialog: {
        remoteRepositoryNotFound: 'The remote repository link is down',
        duplicateAddRepositoryContent: 'Each repository only needs to be added once! Do not add it again!',
        isNotARepo: "This folder is not a repository",
        repoisNotExist: "This repository is not exist!",
        theGitHaveNotInstall: 'The Git haven\'t install! Please install it and restart this app',
        alias: 'Name',
        avatar: 'Avatar',
        repoInfoEditorDialogTitle: 'Edit Repository Info',
        realtime: 'RT Monitoring',
        isTop: 'Top',
        isHidden: 'Hidden',
        TouchToSelect: 'Touch to select',
        select: 'Select',
        selectImage: 'Select Image',
    },
    author: {
        name: 'Name',
        email: 'Email',
        commits: 'Commites'
    },
    chart: {
        contributeMasterChartCommitTitle: 'Contributions, excluding merge commits',
        contributeMasterChartDeleteTitle: 'The number of rows in the commit for deletion',
        contributeMasterChartInsertTitle: 'The number of rows in the commit for insertion',
        selectPrefix: 'Contributions:',
        commitsOption: 'Commits',
        insertionsOption: 'Insertions',
        deletionsOption: 'Deletions',
    },
    errorTitle: {
        networkError: 'NETWORK ERROR'
    },
    errorContent: {
        canNotLinkToRemote: 'Unable to connect to the remote repository of {repoName}'
    },
    pageName: {
        commit: 'Commit View',
        detail: 'Repo Detail',
        files: 'File View',
        commitDetail: 'Commit Detail'
    },
    openWith: {
        title: 'Open with',
        addTitle: 'Add'
    },
    openWithDialog: {
        del: 'Delete',
    },
    openedFile:{
        close: 'Close'
    },
    setting: {
        general: 'General',
        language: 'Language',
        advanced: 'Advanced',
        about: 'About',
        help: 'Help',
    },
    generalSetting: {
        repsitory: 'Respoitory',
        path: 'Path',
        avatar: 'Avatar',
        alias: 'Alias',
        watchable: 'Watchable',
        top: 'Top',
        hidden: 'Hidden',
        repoSetting: 'Repository Setting'
    },
    langSetting: {
        langSelect: 'Select Language',
        changeDialogTitle: 'Tip',
        changeDialogContent: 'It takes effect after the application is restarted'
    }
}