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
    'src/plugin/__tests__/background/background-ast.feature',
)

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

function getRuleArgument(
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

    Scenario(`Add Background in Feautre`, ({ Given, When, Then }) => {
        Given(`Feature has no Background`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                getCallExpression({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Background',
                }),
            ).toBeUndefined()

            expect(getFeatureArgument(specFilePath)).toContain('Scenario')
            expect(getFeatureArgument(specFilePath)).not.toContain('Background')
        })
        When(`I add a Background in Feature`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()
        })
        Then(`vitest-cucumber add a Background in Feature`, () => {
            expect(
                getCallExpression({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Background',
                }),
            ).not.toBeUndefined()

            expect(getFeatureArgument(specFilePath)).toContain('Scenario')
            expect(getFeatureArgument(specFilePath)).toContain('Background')
        })
    })

    Scenario(`Remove Background in Feature`, ({ Given, When, Then }) => {
        Given(`Feature has a Background`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                getCallExpression({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Background',
                }),
            ).not.toBeUndefined()

            expect(getFeatureArgument(specFilePath)).toContain('Scenario')
            expect(getFeatureArgument(specFilePath)).toContain('Background')
        })
        When(
            `I remove Background from Feature`,
            async (_, docString: string) => {
                fs.writeFileSync(featureFilePath, docString)
                await featureAst.updateSpecFile()
            },
        )
        Then(`vitest-cucumber remove Background in Feature`, () => {
            expect(
                getCallExpression({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Background',
                }),
            ).toBeUndefined()

            expect(getFeatureArgument(specFilePath)).toContain('Scenario')
            expect(getFeatureArgument(specFilePath)).not.toContain('Background')
        })
    })

    Scenario(`Add Background in Rule`, ({ Given, When, Then }) => {
        Given(
            `{string} Rule has no Background`,
            async (_, ruleName: string, docString: string) => {
                fs.writeFileSync(featureFilePath, docString)
                await featureAst.updateSpecFile()

                expect(
                    getCallExpression({
                        sourceFile: getSourceFileFromPath(specFilePath),
                        text: 'RuleBackground',
                    }),
                ).toBeUndefined()

                expect(getRuleArgument(specFilePath, ruleName)).toContain(
                    'RuleScenario',
                )
                expect(getRuleArgument(specFilePath, ruleName)).not.toContain(
                    'RuleBackground',
                )
            },
        )
        When(`I add a Background in Rule`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()
        })
        Then(
            `vitest-cucumber add a Background in {string} Rule`,
            (_, ruleName: string) => {
                expect(
                    getCallExpression({
                        sourceFile: getSourceFileFromPath(specFilePath),
                        text: 'RuleBackground',
                    }),
                ).not.toBeUndefined()

                expect(getRuleArgument(specFilePath, ruleName)).toContain(
                    'RuleScenario',
                )
                expect(getRuleArgument(specFilePath, ruleName)).toContain(
                    'RuleBackground',
                )
            },
        )
    })

    Scenario(`Remove Background in Rule`, ({ Given, When, Then }) => {
        Given(
            `{string} Rule has Background`,
            async (_, ruleName: string, docString: string) => {
                fs.writeFileSync(featureFilePath, docString)
                await featureAst.updateSpecFile()

                expect(
                    getCallExpression({
                        sourceFile: getSourceFileFromPath(specFilePath),
                        text: 'RuleBackground',
                    }),
                ).not.toBeUndefined()

                expect(getRuleArgument(specFilePath, ruleName)).toContain(
                    'RuleScenario',
                )
                expect(getRuleArgument(specFilePath, ruleName)).toContain(
                    'RuleBackground',
                )
            },
        )
        When(`I remove Background from Rule`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()
        })
        Then(
            `vitest-cucumber remove Background from {string} Rule`,
            (_, ruleName: string) => {
                expect(
                    getCallExpression({
                        sourceFile: getSourceFileFromPath(specFilePath),
                        text: 'RuleBackground',
                    }),
                ).toBeUndefined()
                expect(getRuleArgument(specFilePath, ruleName)).toContain(
                    'RuleScenario',
                )
                expect(getRuleArgument(specFilePath, ruleName)).not.toContain(
                    'RuleBackground',
                )
            },
        )
    })
})

it('should keep hooks arg when add/remove background', async () => {
    const featureFilePath = 'src/__tests__/background-arg-ast.feature'
    const specFilePath = 'src/__tests__/background-arg-ast.spec.ts'

    fs.writeFileSync(
        specFilePath,
        `
        describeFeature(feature, ({ AfterAllScenarios, BeforeAllScenarios }) => {
            AfterAllScenarios(() => {
                console.debug('after all')
            })
        })
        `,
    )
    fs.writeFileSync(
        featureFilePath,
        `
        Feature: I love Background
            Background:
                Given I am a Scenario step
            Scenario: required
                Then I need to be here
        `,
    )
    await FeatureAst.fromOptions({
        specFilePath,
        featureFilePath,
    }).updateSpecFile()

    let args = getFeatureArgument(specFilePath)

    expect(args).toContain('AfterAllScenarios')
    expect(args).toContain('BeforeAllScenarios')
    expect(args).toContain('Background')
    expect(args).toContain('Scenario')

    fs.writeFileSync(
        featureFilePath,
        `
        Feature: I love Background
            Scenario: required
                Then I need to be here
        `,
    )
    await FeatureAst.fromOptions({
        specFilePath,
        featureFilePath,
    }).updateSpecFile()

    args = getFeatureArgument(specFilePath)

    expect(args).not.toContain('Background')
})
