import path from 'node:path'
import { Project, type SourceFile } from 'ts-morph'

export type AstOptions = {
    specFilePath: string
    featureFilePath: string
}

export abstract class BaseAst {
    protected options: AstOptions
    protected project = new Project({})
    protected sourceFile: SourceFile

    protected constructor(options: AstOptions) {
        this.options = options
        this.project.addSourceFilesAtPaths(options.specFilePath)

        this.sourceFile = this.checkSourceFile()
    }

    private checkSourceFile(): SourceFile {
        const realSpecPath = path.resolve(
            process.cwd(),
            this.options.specFilePath,
        )
        const sourceFile = this.project.getSourceFiles(realSpecPath).at(0)

        if (sourceFile) {
            return sourceFile
        }

        throw new Error(`sourcefile not found : ${realSpecPath}`)
    }
}
