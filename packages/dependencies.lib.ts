export const dependencies = [
    {
        origin: ["node_modules", "better-sqlite3", "build", "Release", "better_sqlite3.node"],
        dev: ["better_sqlite3.node"],
        build: ["compiled", process.versions.node, process.platform, process.arch, "better_sqlite3.node"]
    }
]