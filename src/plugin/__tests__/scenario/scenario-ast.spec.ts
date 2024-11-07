import fs from 'node:fs'
import { expect } from 'vitest'
import { describeFeature, loadFeature } from '../../../../src/module'
import { FeatureAst } from '../../ast/FeatureAst'
import {
    getCallExpressionWithArg,
    getSourceFileFromPath,
} from '../../ast/ast-utils'

const feature = await loadFeature(
    'src/plugin/__tests__/scenario/scenario-ast.feature',
)

describeFeature(feature, ({ Background, Scenario }) => {
    let featureAst: FeatureAst
    let featureFilePath: string
    let specFilePath: string

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

    Scenario(`Add Scenario in Feautre`, ({ Given, When, Then }) => {
        Given(`Feature has one Scenario`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Scenario',
                    arg: 'A normal scenario',
                }),
            ).not.toBeUndefined()

            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Scenario',
                    arg: 'Another scenario',
                }),
            ).toBeUndefined()
        })
        When(`I add a Scenario in Feature`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()
        })
        Then(`vitest-cucumber add a Scenario in Feature`, () => {
            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Scenario',
                    arg: 'Another scenario',
                }),
            ).not.toBeUndefined()
            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Scenario',
                    arg: 'A normal scenario',
                }),
            ).not.toBeUndefined()
        })
    })

    Scenario(`Remove Background in Feature`, ({ Given, When, Then }) => {
        Given(`Feature has two Scenario`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Scenario',
                    arg: 'A normal scenario',
                }),
            ).not.toBeUndefined()

            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Scenario',
                    arg: 'Another scenario',
                }),
            ).not.toBeUndefined()
        })
        When(
            `I remove Background from Feature`,
            async (_, docString: string) => {
                fs.writeFileSync(featureFilePath, docString)
                await featureAst.updateSpecFile()
            },
        )
        Then(`vitest-cucumber remove Scenario from Feature`, () => {
            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Scenario',
                    arg: 'A normal scenario',
                }),
            ).not.toBeUndefined()

            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Scenario',
                    arg: 'Another scenario',
                }),
            ).toBeUndefined()
        })
    })

    Scenario(`Add Scenario in Rule`, ({ Given, When, Then }) => {
        Given(`Rule has one Scenario`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'RuleScenario',
                    arg: 'A normal scenario',
                }),
            ).not.toBeUndefined()
            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'RuleScenario',
                    arg: 'Another scenario',
                }),
            ).toBeUndefined()
        })
        When(`I add a Scenario in Rule`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()
        })
        Then(`vitest-cucumber add a Scenario in Rule`, () => {
            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'RuleScenario',
                    arg: 'A normal scenario',
                }),
            ).not.toBeUndefined()
            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'RuleScenario',
                    arg: 'Another scenario',
                }),
            ).not.toBeUndefined()
        })
    })

    Scenario(`Remove Background in Rule`, ({ Given, When, Then }) => {
        Given(`Rule has two Scenario`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'RuleScenario',
                    arg: 'A normal scenario',
                }),
            ).not.toBeUndefined()
            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'RuleScenario',
                    arg: 'Another scenario',
                }),
            ).not.toBeUndefined()
        })
        When(`I remove a Scenario from Rule`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()
        })
        Then(`vitest-cucumber remove a Scenario from Rule`, () => {
            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'RuleScenario',
                    arg: 'A normal scenario',
                }),
            ).not.toBeUndefined()
            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'RuleScenario',
                    arg: 'Another scenario',
                }),
            ).toBeUndefined()
        })
    })
})
