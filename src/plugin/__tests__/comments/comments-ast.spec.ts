import fs from 'node:fs'
import { expect } from 'vitest'
import { generateStep } from '../../../../scripts/generateFile'
import { describeFeature, loadFeature } from '../../../../src/module'
import { Step, StepTypes } from '../../../parser/models'
import { FeatureAst } from '../../ast/FeatureAst'
import {
    getCallExpression,
    getCallExpressionWithArg,
    getSourceFileFromPath,
} from '../../ast/ast-utils'

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
                    getCallExpressionWithArg({
                        sourceFile: getSourceFileFromPath(specFilePath),
                        text: 'Given',
                        arg: 'I am first step',
                    }),
                ).not.toBeUndefined()
                expect(
                    getCallExpressionWithArg({
                        sourceFile: getSourceFileFromPath(specFilePath),
                        text: 'Then',
                        arg: 'I am last step',
                    }),
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
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Given',
                    arg: 'I am first step',
                }),
            ).toBeUndefined()
            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Then',
                    arg: 'I am last step',
                }),
            ).not.toBeUndefined()
        })
    })

    Scenario('Comment Background removed from Feature', (s) => {
        let originalBackgroundCode: string[]

        s.Given('Feature has a Background', async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            const backgroundCall = getCallExpression({
                sourceFile: getSourceFileFromPath(specFilePath),
                text: 'Background',
            })

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
                getCallExpression({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Background',
                }),
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

            const scenarioCall = getCallExpressionWithArg({
                sourceFile: getSourceFileFromPath(specFilePath),
                text: 'Scenario',
                arg: 'first scenario',
            })

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
                    getCallExpressionWithArg({
                        sourceFile: getSourceFileFromPath(specFilePath),
                        text: 'Scenario',
                        arg: scenarioName,
                    }),
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

                const scenarioCall = getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Rule',
                    arg: ruleName,
                })

                originalRuleCode = scenarioCall?.getText().split('\n') || []

                expect(scenarioCall).not.toBeUndefined()
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
                expect(
                    getCallExpressionWithArg({
                        sourceFile: getSourceFileFromPath(specFilePath),
                        text: 'Rule',
                        arg: ruleName,
                    }),
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
