import { SyntaxKind } from 'ts-morph'
import {
    getCallExpression,
    getCallExpressionWithArg,
    getSourceFileFromPath,
} from '../ast/ast-utils'

export function getFeatureArgument(specFilePath: string): string | undefined {
    const scenarioCallback = getCallExpression({
        sourceFile: getSourceFileFromPath(specFilePath),
        text: 'describeFeature',
    })

    const scenarioArrowFunction = scenarioCallback
        ?.getArguments()
        .find((arg) => arg.getKind() === SyntaxKind.ArrowFunction)

    const res = scenarioArrowFunction
        ?.getFirstDescendantByKind(SyntaxKind.ObjectBindingPattern)
        ?.getText()

    return res
}

export function getRuleArgument(
    specFilePath: string,
    ruleName: string,
): string | undefined {
    const scenarioCallback = getCallExpressionWithArg({
        sourceFile: getSourceFileFromPath(specFilePath),
        text: 'Rule',
        arg: ruleName,
    })

    const scenarioArrowFunction = scenarioCallback
        ?.getArguments()
        .find((arg) => arg.getKind() === SyntaxKind.ArrowFunction)

    const res = scenarioArrowFunction
        ?.getFirstDescendantByKind(SyntaxKind.ObjectBindingPattern)
        ?.getText()

    return res
}

export function getScenarioArgument(
    specFilePath: string,
    scenarioName: string,
): string | undefined {
    const scenarioCallback = getCallExpressionWithArg({
        sourceFile: getSourceFileFromPath(specFilePath),
        text: 'Scenario',
        arg: scenarioName,
    })
    const scenarioArrowFunction = scenarioCallback
        ?.getArguments()
        .find((arg) => arg.getKind() === SyntaxKind.ArrowFunction)

    return scenarioArrowFunction
        ?.getFirstDescendantByKind(SyntaxKind.ObjectBindingPattern)
        ?.getText()
}

export function getBackgroundArgument(
    specFilePath: string,
): string | undefined {
    const scenarioCallback = getCallExpression({
        sourceFile: getSourceFileFromPath(specFilePath),
        text: 'Background',
    })
    const scenarioArrowFunction = scenarioCallback
        ?.getArguments()
        .find((arg) => arg.getKind() === SyntaxKind.ArrowFunction)

    return scenarioArrowFunction
        ?.getFirstDescendantByKind(SyntaxKind.ObjectBindingPattern)
        ?.getText()
}
