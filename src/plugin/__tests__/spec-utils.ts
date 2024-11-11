import { Project, type SourceFile, SyntaxKind } from 'ts-morph'
import { AstUtils } from '../ast/AstUtils'

export function getSourceFileFromPath(path: string): SourceFile {
    const porject = new Project()
    porject.addSourceFilesAtPaths(path)
    const srouceFile = porject.getSourceFiles(path).at(0)

    if (srouceFile) {
        return srouceFile
    }

    throw new Error(`sourceFile not found for ${path}`)
}

export function getFeatureArgument(specFilePath: string): string | undefined {
    const sourceFile = getSourceFileFromPath(specFilePath)
    const featureArrowFunction = AstUtils.fromSourceFile(sourceFile)
        .listDescendantCallExpressions()
        .matchExpressionName('describeFeature')
        .getOne()
        ?.getArguments()
        .find((arg) => arg.getKind() === SyntaxKind.ArrowFunction)

    const res = featureArrowFunction
        ?.getFirstDescendantByKind(SyntaxKind.ObjectBindingPattern)
        ?.getText()

    return res
}

export function getRuleArgument(
    specFilePath: string,
    ruleName: string,
): string | undefined {
    const sourceFile = getSourceFileFromPath(specFilePath)
    const ruleArrowFunction = AstUtils.fromSourceFile(sourceFile)
        .listDescendantCallExpressions()
        .matchExpressionName('Rule')
        .matchExpressionArg(ruleName)
        .getOne()
        ?.getArguments()
        .find((arg) => arg.getKind() === SyntaxKind.ArrowFunction)

    const res = ruleArrowFunction
        ?.getFirstDescendantByKind(SyntaxKind.ObjectBindingPattern)
        ?.getText()

    return res
}

export function getScenarioArgument(
    specFilePath: string,
    scenarioName: string,
): string | undefined {
    const sourceFile = getSourceFileFromPath(specFilePath)

    const scenarioArrowFunction = AstUtils.fromSourceFile(sourceFile)
        .listDescendantCallExpressions()
        .matchExpressionName('Scenario')
        .matchExpressionArg(scenarioName)
        .getOne()
        ?.getArguments()
        .find((arg) => arg.getKind() === SyntaxKind.ArrowFunction)

    return scenarioArrowFunction
        ?.getFirstDescendantByKind(SyntaxKind.ObjectBindingPattern)
        ?.getText()
}

export function getBackgroundArgument(
    specFilePath: string,
): string | undefined {
    const sourceFile = getSourceFileFromPath(specFilePath)

    const backgroundArrowFunction = AstUtils.fromSourceFile(sourceFile)
        .listDescendantCallExpressions()
        .matchExpressionName('Background')
        .getOne()
        ?.getArguments()
        .find((arg) => arg.getKind() === SyntaxKind.ArrowFunction)

    return backgroundArrowFunction
        ?.getFirstDescendantByKind(SyntaxKind.ObjectBindingPattern)
        ?.getText()
}
