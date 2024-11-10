import fs from 'node:fs'
import { expect } from 'vitest'
import { generateStep } from '../../../../scripts/generateFile'
import { describeFeature, loadFeature } from '../../../../src/module'
import { Step, StepTypes } from '../../../parser/models'
import { AstUtils } from '../../ast/AstUtils'
import { FeatureAst } from '../../ast/FeatureAst'
import { getSourceFileFromPath } from '../spec-utils'

const feature = await loadFeature(
    'src/plugin/__tests__/comments/comments-ast.feature',
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
                onDeleteAction: 'comment',
            })
        })
    })

    Scenario(`Comment steps removed from Scenario`, ({ Given, When, Then }) => {
        Given(
            `"Example" Scenario has two steps`,
            async (_, docString: string) => {
                fs.writeFileSync(featureFilePath, docString)
                await featureAst.updateSpecFile()

                expect(
                    AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                        .listDescendantCallExpressions()
                        .matchExpressionName('Given')
                        .matchExpressionArg('I am first step')
                        .getOne(),
                ).not.toBeUndefined()
                expect(
                    AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                        .listDescendantCallExpressions()
                        .matchExpressionName('Then')
                        .matchExpressionArg('I am last step')
                        .getOne(),
                ).not.toBeUndefined()
            },
        )
        When(`I remove "Given" step`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()
        })
        Then(`vitest-cucumber comments "Given" step`, () => {
            const specCode = fs.readFileSync(specFilePath).toString()
            const stepCode = generateStep(
                new Step(StepTypes.GIVEN, 'I am first step'),
            ).trim()

            expect(specCode.includes(`// ${stepCode}`)).toBeTruthy()

            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('Given')
                    .matchExpressionArg('I am first step')
                    .getOne(),
            ).toBeUndefined()
            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('Then')
                    .matchExpressionArg('I am last step')
                    .getOne(),
            ).not.toBeUndefined()
        })
    })

    Scenario('Comment Background removed from Feature', (s) => {
        let originalBackgroundCode: string[]

        s.Given('Feature has a Background', async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            const sourceFile = getSourceFileFromPath(specFilePath)
            const backgroundCall = AstUtils.fromSourceFile(sourceFile)
                .listDescendantCallExpressions()
                .matchExpressionName('Background')
                .getOne()

            originalBackgroundCode = backgroundCall?.getText().split('\n') || []

            expect(backgroundCall).not.toBeUndefined()
        })
        s.When(
            'I remove Background from Feature',
            async (_, docString: string) => {
                fs.writeFileSync(featureFilePath, docString)
                await featureAst.updateSpecFile()
            },
        )
        s.Then('vitest-cucumber comments Background in Feature', () => {
            expect(
                AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                    .listDescendantCallExpressions()
                    .matchExpressionName('Background')
                    .getOne(),
            ).toBeUndefined()

            const specContent = fs.readFileSync(specFilePath).toString()

            expect(
                originalBackgroundCode.every((line) => {
                    return specContent.includes(`// ${line}`)
                }),
            ).toBeTruthy()
        })
    })

    Scenario('Comment removed Scenario from Feature', (s) => {
        let originalScenarioCode: string[]

        s.Given('Feature has a two Scenario', async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            const scenarioCall = AstUtils.fromSourceFile(
                getSourceFileFromPath(specFilePath),
            )
                .listDescendantCallExpressions()
                .matchExpressionName('Scenario')
                .matchExpressionArg('first scenario')
                .getOne()

            originalScenarioCode = scenarioCall?.getText().split('\n') || []

            expect(scenarioCall).not.toBeUndefined()
        })
        s.When(
            'I remove a "first scenario" Scenario from Feature',
            async (_, docString: string) => {
                fs.writeFileSync(featureFilePath, docString)
                await featureAst.updateSpecFile()
            },
        )
        s.Then(
            'vitest-cucumber comments {string} Scenario in Feature',
            (_, scenarioName: string) => {
                expect(
                    AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                        .listDescendantCallExpressions()
                        .matchExpressionName('Scenario')
                        .matchExpressionArg(scenarioName)
                        .getOne(),
                ).toBeUndefined()

                const specContent = fs.readFileSync(specFilePath).toString()

                expect(
                    originalScenarioCode.every((line) => {
                        return specContent.includes(`// ${line}`)
                    }),
                ).toBeTruthy()
            },
        )
    })

    Scenario('Comment removed Rule from Feature', (s) => {
        let originalRuleCode: string[]

        s.Given(
            'Feature has a {string} Rule',
            async (_, ruleName: string, docString: string) => {
                fs.writeFileSync(featureFilePath, docString)
                await featureAst.updateSpecFile()

                const sourceFile = getSourceFileFromPath(specFilePath)
                const ruleCall = AstUtils.fromSourceFile(sourceFile)
                    .listDescendantCallExpressions()
                    .matchExpressionName('Rule')
                    .matchExpressionArg(ruleName)
                    .getOne()

                originalRuleCode = ruleCall?.getText().split('\n') || []

                expect(ruleCall).not.toBeUndefined()
            },
        )
        s.When(
            'I remove a "main" Rule from Feature',
            async (_, docString: string) => {
                fs.writeFileSync(featureFilePath, docString)
                await featureAst.updateSpecFile()
            },
        )
        s.Then(
            'vitest-cucumber comments {string} Rule in Feature',
            (_, ruleName: string) => {
                const sourceFile = getSourceFileFromPath(specFilePath)
                expect(
                    AstUtils.fromSourceFile(sourceFile)
                        .listDescendantCallExpressions()
                        .matchExpressionName('Rule')
                        .matchExpressionArg(ruleName)
                        .getOne(),
                ).toBeUndefined()

                const specContent = fs.readFileSync(specFilePath).toString()

                expect(
                    originalRuleCode.every((line) => {
                        return specContent.includes(`// ${line}`)
                    }),
                ).toBeTruthy()
            },
        )
    })
})
