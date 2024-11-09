import fs from 'node:fs'
import { SyntaxKind } from 'ts-morph'
import { expect, it } from 'vitest'
import { describeFeature, loadFeature } from '../../../../src/module'
import { FeatureAst } from '../../ast/FeatureAst'
import {
    getCallExpression,
    getCallExpressionWithArg,
    getSourceFileFromPath,
} from '../../ast/ast-utils'

const feature = await loadFeature(
    'src/plugin/__tests__/steps/steps-ast.feature',
)

type StepVariables = {
    title: string
    type: string
    count: number
    'before-count': number
}

function getScenarioArgument(
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

function getBackgroundArgument(specFilePath: string): string | undefined {
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

describeFeature(feature, ({ Background, ScenarioOutline, Scenario }) => {
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

    ScenarioOutline(
        `Add steps in Scenario`,
        ({ Given, When, Then }, variables) => {
            const { type, title } = variables as StepVariables

            Given(
                `{string} Scenario one step`,
                async (_, scenarioName: string, docString: string) => {
                    fs.writeFileSync(featureFilePath, docString)
                    await featureAst.updateSpecFile()

                    expect(
                        getScenarioArgument(specFilePath, scenarioName),
                    ).toContain('Given')
                    expect(
                        getScenarioArgument(specFilePath, scenarioName),
                    ).not.toContain(type)
                    expect(
                        getCallExpressionWithArg({
                            sourceFile: getSourceFileFromPath(specFilePath),
                            text: 'Given',
                            arg: 'I am already in scenario',
                        }),
                    ).not.toBeUndefined()
                    expect(
                        getCallExpressionWithArg({
                            sourceFile: getSourceFileFromPath(specFilePath),
                            text: type,
                            arg: title,
                        }),
                    ).toBeUndefined()
                },
            )
            When(
                `I add a <type> <title> step`,
                async (_, docString: string) => {
                    fs.writeFileSync(featureFilePath, docString)
                    await featureAst.updateSpecFile()
                },
            )
            Then(
                `{string} Scenario has two steps`,
                (_, scenarioName: string) => {
                    expect(
                        getCallExpressionWithArg({
                            sourceFile: getSourceFileFromPath(specFilePath),
                            text: 'Given',
                            arg: 'I am already in scenario',
                        }),
                    ).not.toBeUndefined()
                    expect(
                        getCallExpressionWithArg({
                            sourceFile: getSourceFileFromPath(specFilePath),
                            text: type,
                            arg: title,
                        }),
                    ).not.toBeUndefined()

                    expect(
                        getScenarioArgument(specFilePath, scenarioName),
                    ).toContain('Given')
                    expect(
                        getScenarioArgument(specFilePath, scenarioName),
                    ).toContain(type)
                },
            )
        },
    )

    Scenario(`Remove step from Scenario`, ({ Given, When, Then }) => {
        Given(
            `{string} Scenario has two steps`,
            async (_, scenarioName: string, docString: string) => {
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
                        arg: 'I  am last step',
                    }),
                ).not.toBeUndefined()

                expect(
                    getScenarioArgument(specFilePath, scenarioName),
                ).toContain('Given')
                expect(
                    getScenarioArgument(specFilePath, scenarioName),
                ).toContain('Then')
            },
        )
        When(
            `I remove a step in "main" Scenario`,
            async (_, docString: string) => {
                fs.writeFileSync(featureFilePath, docString)
                await featureAst.updateSpecFile()
            },
        )
        Then(`{string} scenario has one step`, (_, scenarioName: string) => {
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
                    arg: 'I  am last step',
                }),
            ).not.toBeUndefined()

            expect(
                getScenarioArgument(specFilePath, scenarioName),
            ).not.toContain('Given')
            expect(getScenarioArgument(specFilePath, scenarioName)).toContain(
                'Then',
            )
        })
    })

    ScenarioOutline(
        `Add steps in Background`,
        ({ Given, When, Then }, variables) => {
            const { type, title } = variables as StepVariables

            Given(
                `Feature has a Background with one step`,
                async (_, docString: string) => {
                    fs.writeFileSync(featureFilePath, docString)
                    await featureAst.updateSpecFile()

                    expect(
                        getCallExpressionWithArg({
                            sourceFile: getSourceFileFromPath(specFilePath),
                            text: 'Given',
                            arg: 'I am first background step',
                        }),
                    ).not.toBeUndefined()
                    expect(
                        getCallExpressionWithArg({
                            sourceFile: getSourceFileFromPath(specFilePath),
                            text: type,
                            arg: title,
                        }),
                    ).toBeUndefined()
                    expect(getBackgroundArgument(specFilePath)).toContain(
                        'Given',
                    )
                    expect(getBackgroundArgument(specFilePath)).not.toContain(
                        type,
                    )
                },
            )
            When(
                `I add a <type> <title> step in Background`,
                async (_, docString: string) => {
                    fs.writeFileSync(featureFilePath, docString)
                    await featureAst.updateSpecFile()
                },
            )
            Then(`Background has two steps`, () => {
                expect(
                    getCallExpressionWithArg({
                        sourceFile: getSourceFileFromPath(specFilePath),
                        text: 'Given',
                        arg: 'I am first background step',
                    }),
                ).not.toBeUndefined()
                expect(
                    getCallExpressionWithArg({
                        sourceFile: getSourceFileFromPath(specFilePath),
                        text: type,
                        arg: title,
                    }),
                ).not.toBeUndefined()

                expect(getBackgroundArgument(specFilePath)).toContain('Given')
                expect(getBackgroundArgument(specFilePath)).toContain(type)
            })
        },
    )

    Scenario(`Remove step from Background`, ({ Given, When, Then }) => {
        Given(`Background has two steps`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Given',
                    arg: 'I am first background step',
                }),
            ).not.toBeUndefined()
            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'And',
                    arg: 'I am last background step',
                }),
            ).not.toBeUndefined()

            expect(getBackgroundArgument(specFilePath)).toContain('Given')
            expect(getBackgroundArgument(specFilePath)).toContain('And')
        })
        When(
            `I remove a step in "main" Scenario`,
            async (_, docString: string) => {
                fs.writeFileSync(featureFilePath, docString)
                await featureAst.updateSpecFile()
            },
        )
        Then(`Background has one step`, () => {
            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Given',
                    arg: 'I am first background step',
                }),
            ).not.toBeUndefined()
            expect(
                getCallExpressionWithArg({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'And',
                    arg: 'I am last background step',
                }),
            ).toBeUndefined()

            expect(getBackgroundArgument(specFilePath)).toContain('Given')
            expect(getBackgroundArgument(specFilePath)).not.toContain('And')
        })
    })
})

it('should match step with expression before remove it', async () => {
    const featureFilePath = 'src/__tests__/step-comment-ast.feature'
    const specFilePath = 'src/__tests__/step-comment-ast.spec.ts'
    fs.writeFileSync(
        featureFilePath,
        `
        Feature: I love Scenario
            Scenario: A normal scenario
                Given I am a "Given" scenario step
        `,
    )
    fs.writeFileSync(
        specFilePath,
        `
        describeFeature(feature, ({ Scenario }) => {
            Scenario("A normal scenario", ({ Given, Then }) => {
                Given('I am a {string} scenario step', (_, name: string) => {
                    console.debug({ name })
                })
            })
        })
        `,
    )
    const featureAst = FeatureAst.fromOptions({
        specFilePath,
        featureFilePath,
    })
    await featureAst.updateSpecFile()

    expect(
        fs
            .readFileSync(specFilePath)
            .toString()
            .includes('I am a {string} scenario step'),
    ).toBeTruthy()
})
