import {
    type ArrowFunction,
    type CallExpression,
    type SourceFile,
    SyntaxKind,
} from 'ts-morph'

type AllowedSource = SourceFile | ArrowFunction

export class AstUtils {
    private callExpressions: CallExpression[] = []

    private readonly sourceParent: AllowedSource

    private constructor(sourceParent: AllowedSource) {
        this.sourceParent = sourceParent
    }

    public static fromSourceFile(sourceFile: SourceFile) {
        return new AstUtils(sourceFile)
    }

    public static fromArrowFunction(parent: ArrowFunction) {
        return new AstUtils(parent)
    }

    public listDescendantCallExpressions() {
        this.callExpressions = this.sourceParent.getDescendantsOfKind(
            SyntaxKind.CallExpression,
        )

        return this
    }

    public matchExpressionName(text: string) {
        this.callExpressions = this.callExpressions.filter((expression) => {
            return expression.getExpression().getText() === text
        })

        return this
    }

    public matchExpressionArg(argRequired: string) {
        this.callExpressions = this.callExpressions.filter((expression) => {
            return expression
                .getArguments()
                .find((arg) => AstUtils.isString(arg.getKind()))
                ?.getText()
                .replace(/^['"`]|['"`]$/g, '')
                .includes(argRequired)
        })

        return this
    }

    public textMatchRegex(regex: RegExp) {
        this.callExpressions = this.callExpressions.filter((expression) => {
            return regex.test(expression.getText())
        })

        return this
    }

    public getAll(): CallExpression[] {
        return this.callExpressions
    }

    public getOne(): CallExpression | undefined {
        return this.callExpressions.at(0)
    }

    public static isString(kind: SyntaxKind): boolean {
        return [
            SyntaxKind.StringLiteral,
            SyntaxKind.NoSubstitutionTemplateLiteral,
            SyntaxKind.TemplateExpression,
        ].includes(kind)
    }
}
