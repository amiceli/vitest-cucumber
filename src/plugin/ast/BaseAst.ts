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
    onDeleteAction?: 'comment' | 'delete'
}

export type VitestCallExpression = {
    name: string
    callExpression: CallExpression
}

export abstract class BaseAst {
    protected readonly options: AstOptions
    protected readonly project: Project
    protected readonly sourceFile: SourceFile
    protected readonly onDeleteAction: 'comment' | 'delete'

    protected constructor(options: AstOptions) {
        this.options = options
        this.onDeleteAction = options.onDeleteAction || 'delete'

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

    protected removeChildFromParent(
        parent: ArrowFunction,
        child: CallExpression,
    ) {
        const childParentNode = child.getParentIfKind(
            SyntaxKind.ExpressionStatement,
        )

        if (childParentNode) {
            parent.removeStatement(childParentNode.getChildIndex())
        }
    }

    protected commentExpression(parent: ArrowFunction, child: CallExpression) {
        const code = child
            .getText()
            .split('\n')
            .map((line) => `// ${line}`)
            .join('\n')

        this.removeChildFromParent(parent, child)

        parent.addStatements(code)
    }

    protected updateSyntaxListChild(
        arrow: ArrowFunction,
        newArgs: string[],
    ): void {
        const syntaxListChild = arrow.getFirstChildByKind(SyntaxKind.SyntaxList)

        if (syntaxListChild) {
            const currentArgs = [
                ...syntaxListChild
                    .getText()
                    .matchAll(
                        /\b(BeforeEachScenario|BeforeAllScenarios|AfterAllScenarios|AfterEachScenario)\b/g,
                    ),
            ].map((match) => match[0])

            syntaxListChild.replaceWithText(
                `{ ${newArgs.concat(currentArgs).join(',')} }`,
            )
        } else {
            arrow.insertParameter(0, {
                name: `{ ${newArgs.join(',')} }`,
            })
        }
    }

    protected get shouldComment(): boolean {
        return this.onDeleteAction === 'comment'
    }
}
