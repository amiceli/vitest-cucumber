import fs from 'node:fs'
import { expect } from 'vitest'
import { describeFeature, loadFeature } from '../../../../src/module'
import { FeatureAst } from '../../ast/FeatureAst'
import {
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

describeFeature(feature, ({ Background, ScenarioOutline, Scenario }) => {
    let featureAst: FeatureAst
    let featureFilePath: string
    let specFilePath: string

    function writeLine(file: string, line: string) {
        const content = fs.readFileSync(file).toString()

        fs.writeFileSync(file, [content, line].join('\n'))
    }

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

            Given(`"main" Scenario one step`, async (_, docString: string) => {
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
                        text: type,
                        arg: title,
                    }),
                ).toBeUndefined()
            })
            When(`I add a <type> <title> step`, async () => {
                writeLine(featureFilePath, `${type} ${title}`)
                await featureAst.updateSpecFile()
            })
            Then(`"main" Scenario has two steps`, () => {
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
                        text: type,
                        arg: title,
                    }),
                ).not.toBeUndefined()
            })
        },
    )

    Scenario(`Remove step from Scenario`, ({ Given, When, Then }) => {
        Given(`"main" Scenario has two steps`, async (_, docString: string) => {
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
        })
        When(
            `I remove a step in "main" Scenario`,
            async (_, docString: string) => {
                fs.writeFileSync(featureFilePath, docString)
                await featureAst.updateSpecFile()
            },
        )
        Then(`"main" scenario has one step`, () => {
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
                },
            )
            When(`I add a <type> <title> step in Background`, async () => {
                writeLine(featureFilePath, `${type} ${title}`)
                await featureAst.updateSpecFile()
            })
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
        })
    })
})
