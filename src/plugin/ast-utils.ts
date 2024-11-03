import {
    type CallExpression,
    Project,
    type SourceFile,
    SyntaxKind,
} from 'ts-morph'

export function getSourceFileFromPath(path: string): SourceFile | undefined {
    const porject = new Project()
    porject.addSourceFilesAtPaths(path)

    return porject.getSourceFiles(path).at(0)
}

export function getCallExpression(options: {
    sourceFile: SourceFile
    text: string
}): CallExpression | undefined {
    return options.sourceFile
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .find((call) => call.getExpression().getText() === options.text)
}

export function getCallExpressionWithArg(options: {
    sourceFile: SourceFile
    text: string
    arg: string
}): CallExpression | undefined {
    return options.sourceFile
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .filter((call) => {
            return call
                .getArguments()
                .find((arg) => isString(arg.getKind()))
                ?.getText()
                .replace(/^['"`]|['"`]$/g, '')
                .includes(options.arg)
        })
        .find((call) => call.getExpression().getText() === options.text)
}

export function isString(kind: SyntaxKind) {
    return [
        SyntaxKind.StringLiteral,
        SyntaxKind.NoSubstitutionTemplateLiteral,
        SyntaxKind.TemplateExpression,
    ].includes(kind)
}
