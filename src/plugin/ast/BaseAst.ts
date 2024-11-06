import path from 'node:path'
import {
    type ArrowFunction,
    type CallExpression,
    Project,
    type SourceFile,
    SyntaxKind,
} from 'ts-morph'
import { isString } from './ast-utils'

export type AstOptions = {
    specFilePath: string
    featureFilePath: string
}

export type VitestCallExpression = {
    name: string
    callExpression: CallExpression
}

export abstract class BaseAst {
    protected readonly options: AstOptions
    protected readonly project: Project
    protected readonly sourceFile: SourceFile

    protected constructor(options: AstOptions) {
        this.options = options
        this.project = new Project({})
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

    protected callExpressionMatchRegExp(
        parent: ArrowFunction,
        regex: RegExp,
    ): VitestCallExpression[] {
        return parent
            .getDescendantsOfKind(SyntaxKind.CallExpression)
            .filter((call) => {
                return regex.test(call.getText())
            })
            .map((callExpression) => {
                return {
                    name: this.getFirstArgumentAsString(callExpression),
                    callExpression,
                }
            })
            .filter((step): step is VitestCallExpression => {
                return step?.name !== undefined
            })
    }

    protected getFirstArgumentAsString(
        callExpression: CallExpression,
    ): string | undefined {
        return callExpression
            .getArguments()
            .find((arg) => isString(arg.getKind()))
            ?.getText()
            .replace(/^['"`]|['"`]$/g, '')
    }
}
