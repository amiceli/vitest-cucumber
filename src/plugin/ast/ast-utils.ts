import {
    type CallExpression,
    Project,
    type SourceFile,
    SyntaxKind,
} from 'ts-morph'

export function getSourceFileFromPath(path: string): SourceFile {
    const porject = new Project()
    porject.addSourceFilesAtPaths(path)
    const srouceFile = porject.getSourceFiles(path).at(0)

    if (srouceFile) {
        return srouceFile
    }

    throw new Error(`sourceFile not found for ${path}`)
}

export function getAllCallExpression(options: {
    sourceFile: SourceFile
    text: string
}): CallExpression[] {
    return options.sourceFile
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .filter((call) => {
            return call.getExpression().getText() === options.text
        })
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
