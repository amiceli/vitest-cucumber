import fs from 'node:fs'
import { SyntaxKind } from 'ts-morph'
import { expect } from 'vitest'
import { describeFeature, loadFeature } from '../../../../src/module'
import { FeatureAst } from '../../ast/FeatureAst'
import {
    getCallExpression,
    getCallExpressionWithArg,
    getSourceFileFromPath,
} from '../../ast/ast-utils'

const feature = await loadFeature('src/plugin/__tests__/rule/rule-ast.feature')

function getFeatureArgument(specFilePath: string): string | undefined {
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

describeFeature(feature, ({ Background, Scenario, AfterAllScenarios }) => {
    let featureAst: FeatureAst
    let featureFilePath: string
    let specFilePath: string

    AfterAllScenarios(() => {
        fs.rmSync(featureFilePath)
        fs.rmSync(specFilePath)
    })

    Background(({ Given, And }) => {
        Given(`My feature file is {string}`, (_, featurePath: string) => {
            featureFilePath = featurePath
            fs.writeFileSync(featurePath, '')
        })
        And(`My spec file is {string}`, (_, specPath: string) => {
            fs.writeFileSync(specPath, '')
            specFilePath = specPath

            featureAst = FeatureAst.fromOptions({
                specFilePath: specPath,
                featureFilePath,
            })
        })
    })

    Scenario(`Add Rule in Feautre`, ({ Given, When, Then }) => {
        Given(`Feature has no Rule`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                getCallExpression({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Rule',
                }),
            ).toBeUndefined()
            expect(getFeatureArgument(specFilePath)).not.toContain('Rule')
        })
        When(`I add a Scenario in Feature`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()
        })
        Then(`vitest-cucumber add a Rule in Feature`, () => {
            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Rule',
                    arg: 'first rule',
                }),
            ).not.toBeUndefined()

            expect(getFeatureArgument(specFilePath)).toContain('Rule')
            expect(getFeatureArgument(specFilePath)).toContain('Scenario')
        })
    })

    Scenario(`Remove Rule in Feature`, ({ Given, When, Then }) => {
        Given(`Feature has two Rule`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Rule',
                    arg: 'first rule',
                }),
            ).not.toBeUndefined()
            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Rule',
                    arg: 'second rule',
                }),
            ).not.toBeUndefined()
        })
        When(`I remove Rule from Feature`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()
        })
        Then(`vitest-cucumber remove Rule from Feature`, () => {
            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Rule',
                    arg: 'first rule',
                }),
            ).not.toBeUndefined()
            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Rule',
                    arg: 'second rule',
                }),
            ).toBeUndefined()
        })
    })
})
