import fs from 'node:fs'
import { expect } from 'vitest'
import { describeFeature, loadFeature } from '../../../../src/module'
import { AstUtils } from '../../ast/AstUtils'
import { FeatureAst } from '../../ast/FeatureAst'
import { getSourceFileFromPath } from '../spec-utils'

const feature = await loadFeature(
    'src/plugin/__tests__/scenario/scenario-ast.feature',
)

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

    Scenario(`Add Scenario in Feautre`, ({ Given, When, Then }) => {
        Given(`Feature has one Scenario`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('Scenario')
                    .matchExpressionArg('A normal scenario')
                    .getOne(),
            ).not.toBeUndefined()

            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('Scenario')
                    .matchExpressionArg('Another scenario')
                    .getOne(),
            ).toBeUndefined()
        })
        When(`I add a Scenario in Feature`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()
        })
        Then(`vitest-cucumber add a Scenario in Feature`, () => {
            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('Scenario')
                    .matchExpressionArg('Another scenario')
                    .getOne(),
            ).not.toBeUndefined()
            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('Scenario')
                    .matchExpressionArg('A normal scenario')
                    .getOne(),
            ).not.toBeUndefined()
        })
    })

    Scenario(`Remove Background in Feature`, ({ Given, When, Then }) => {
        Given(`Feature has two Scenario`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('Scenario')
                    .matchExpressionArg('A normal scenario')
                    .getOne(),
            ).not.toBeUndefined()

            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('Scenario')
                    .matchExpressionArg('Another scenario')
                    .getOne(),
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
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('Scenario')
                    .matchExpressionArg('A normal scenario')
                    .getOne(),
            ).not.toBeUndefined()

            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('Scenario')
                    .matchExpressionArg('Another scenario')
                    .getOne(),
            ).toBeUndefined()
        })
    })

    Scenario(`Add Scenario in Rule`, ({ Given, When, Then }) => {
        Given(`Rule has one Scenario`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('RuleScenario')
                    .matchExpressionArg('A normal scenario')
                    .getOne(),
            ).not.toBeUndefined()
            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('RuleScenario')
                    .matchExpressionArg('Another scenario')
                    .getOne(),
            ).toBeUndefined()
        })
        When(`I add a Scenario in Rule`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()
        })
        Then(`vitest-cucumber add a Scenario in Rule`, () => {
            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('RuleScenario')
                    .matchExpressionArg('A normal scenario')
                    .getOne(),
            ).not.toBeUndefined()
            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('RuleScenario')
                    .matchExpressionArg('Another scenario')
                    .getOne(),
            ).not.toBeUndefined()
        })
    })

    Scenario(`Remove Background in Rule`, ({ Given, When, Then }) => {
        Given(`Rule has two Scenario`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('RuleScenario')
                    .matchExpressionArg('A normal scenario')
                    .getOne(),
            ).not.toBeUndefined()
            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('RuleScenario')
                    .matchExpressionArg('Another scenario')
                    .getOne(),
            ).not.toBeUndefined()
        })
        When(`I remove a Scenario from Rule`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()
        })
        Then(`vitest-cucumber remove a Scenario from Rule`, () => {
            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('RuleScenario')
                    .matchExpressionArg('A normal scenario')
                    .getOne(),
            ).not.toBeUndefined()
            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('RuleScenario')
                    .matchExpressionArg('Another scenario')
                    .getOne(),
            ).toBeUndefined()
        })
    })

    Scenario(`Add ScenarioOutline in Feautre`, ({ Given, When, Then }) => {
        Given(`Feature has one Scenario`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('Scenario')
                    .matchExpressionArg('A normal scenario')
                    .getOne(),
            ).not.toBeUndefined()

            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('ScenarioOutline')
                    .matchExpressionArg('Another scenario')
                    .getOne(),
            ).toBeUndefined()
        })
        When(
            `I add a Scenario Outline in Feature`,
            async (_, docString: string) => {
                fs.writeFileSync(featureFilePath, docString)
                await featureAst.updateSpecFile()
            },
        )
        Then(`vitest-cucumber add a Scenario Outline in Feature`, () => {
            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('Scenario')
                    .matchExpressionArg('A normal scenario')
                    .getOne(),
            ).not.toBeUndefined()
            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('ScenarioOutline')
                    .matchExpressionArg('Another scenario')
                    .getOne(),
            ).not.toBeUndefined()
        })
    })
})
