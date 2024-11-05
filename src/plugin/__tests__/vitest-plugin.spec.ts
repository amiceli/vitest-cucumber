import fs from 'node:fs'
import { SyntaxKind } from 'ts-morph'
import { expect, vi } from 'vitest'
import {
    VitestCucumberPlugin,
    describeFeature,
    loadFeature,
} from '../../../src/module'
import { FeatureAst } from '../ast/FeatureAst'
import {
    getCallExpression,
    getCallExpressionWithArg,
    getSourceFileFromPath,
} from '../ast/ast-utils'

const feature = await loadFeature('src/plugin/__tests__/vitest-plugin.feature')

describeFeature(feature, (f) => {
    f.AfterEachScenario(() => {
        fs.rmSync('src/__tests__/awesome.spec.ts')
        fs.rmSync('src/__tests__/awesome.feature')
    })

    f.Scenario('Create spec file for new feature file', (s) => {
        const fakeServer = {
            ws: {
                send: vi.fn(),
            },
            // biome-ignore lint/suspicious/noExplicitAny: mock vitest server
        } as any

        s.Given("{string} doesn't exists", (_, specPath: string) => {
            fs.rmSync(specPath, { force: true })
        })
        s.When('I write {string}', async (_, featurePath: string) => {
            vi.spyOn(fs, 'watch').mockImplementation(
                // @ts-ignore
                (_: unknown, __: unknown, cb) => {
                    cb('', 'awesome.feature')
                },
            )

            fs.writeFileSync(
                featurePath,
                `
                Feature: new feature
                    Scenario: new scenario
                        Given I am a step
            `,
            )
            VitestCucumberPlugin({
                specFilesDir: 'src/__tests__/',
                featureFilesDir: 'src/__tests__/',
            }).configureServer(fakeServer)
            await new Promise((resolve) => setTimeout(resolve, 300))
        })
        s.Then('vitest-cucumber create {string}', (_, specPath: string) => {
            const sourceFile = getSourceFileFromPath(specPath)

            if (sourceFile) {
                expect(
                    getCallExpression({
                        sourceFile,
                        text: 'describeFeature',
                    }),
                ).not.toBe(undefined)
                expect(fs.existsSync(specPath)).toBe(true)
                expect(fakeServer.ws.send).toHaveBeenCalled()
            } else {
                expect.fail('sourceFile should not be undefined')
            }
        })
    })

    f.Rule('Update scenario when feature changed', (r) => {
        let featureAst: FeatureAst

        r.RuleBackground(({ Given, And }) => {
            let featureFilePath: string
            Given(`My feature file is {string}`, (_, featurePath: string) => {
                featureFilePath = featurePath
                fs.writeFileSync(featurePath, '')
            })
            And(`My spec file is {string}`, (_, specFilePath: string) => {
                fs.writeFileSync(specFilePath, '')
                featureAst = FeatureAst.fromOptions({
                    specFilePath,
                    featureFilePath,
                })
            })
        })

        r.RuleScenario('Add scenario to spec file', (s) => {
            s.Given("{string} hasn't scenario", (_, specPath: string) => {
                const sourceFile = getSourceFileFromPath(specPath)

                if (sourceFile) {
                    expect(
                        getCallExpression({
                            sourceFile,
                            text: 'Scenario',
                        }),
                    ).toBeUndefined()
                } else {
                    expect.fail('sourceFile should not be undefined')
                }
            })
            s.When(
                'I add a scenario into {string}',
                (_, featurePath: string, docString: string) => {
                    fs.writeFileSync(featurePath, docString)
                },
            )
            s.Then(
                'vitest-cucumber add new scenario in {string}',
                async (_, specPath: string) => {
                    await featureAst.updateSpecFile()

                    const sourceFile = getSourceFileFromPath(specPath)

                    if (sourceFile) {
                        expect(
                            getCallExpression({
                                sourceFile,
                                text: 'Scenario',
                            }),
                        ).not.toBeUndefined()
                    } else {
                        expect.fail('sourceFile should not be undefined')
                    }
                },
            )
        })

        r.RuleScenario('Remove scenario in feature file', (s) => {
            s.Given(
                '{string} has "example" scenario',
                (_, featurePath: string, docstrings) => {
                    fs.writeFileSync(featurePath, docstrings)
                },
            )
            s.And(
                '{string} has "example" scenario',
                async (_, specPath: string) => {
                    await featureAst.updateSpecFile()
                    const sourceFile = getSourceFileFromPath(specPath)

                    if (sourceFile) {
                        expect(
                            getCallExpressionWithArg({
                                sourceFile,
                                text: 'Scenario',
                                arg: 'example',
                            }),
                        ).not.toBeUndefined()
                        expect(
                            getCallExpressionWithArg({
                                sourceFile,
                                text: 'Scenario',
                                arg: 'another',
                            }),
                        ).not.toBeUndefined()
                    } else {
                        expect.fail('sourceFile should not be undefined')
                    }
                },
            )
            s.When(
                'I remove "example" scenario in {string}',
                (_, featurePath: string, docstrings: string) => {
                    fs.writeFileSync(featurePath, docstrings)
                },
            )
            s.Then(
                'vitest-cucumber remove "example" scenario in {string}',
                async (_, specPath: string) => {
                    await featureAst.updateSpecFile()
                    const sourceFile = getSourceFileFromPath(specPath)

                    if (sourceFile) {
                        expect(
                            getCallExpressionWithArg({
                                sourceFile,
                                text: 'Scenario',
                                arg: 'example',
                            }),
                        ).toBeUndefined()
                        expect(
                            getCallExpressionWithArg({
                                sourceFile,
                                text: 'Scenario',
                                arg: 'another',
                            }),
                        ).not.toBeUndefined()
                    } else {
                        expect.fail('sourceFile should not be undefined')
                    }
                },
            )
        })
    })
    f.Rule('Update scenario steps when feature changed', (r) => {
        let featureAst: FeatureAst

        r.RuleBackground((b) => {
            let featureFilePath: string
            let specFilePath: string

            b.Given('My feature file is {string}', (_, featurePath: string) => {
                featureFilePath = featurePath
            })
            b.And('My spec file is {string}', (_, specPath: string) => {
                specFilePath = specPath

                fs.writeFileSync(specFilePath, '')
                featureAst = FeatureAst.fromOptions({
                    specFilePath,
                    featureFilePath,
                })
            })
            b.And(
                'I have "example" Scenario',
                async (_, docStrings: string) => {
                    fs.writeFileSync(featureFilePath, docStrings)
                    await featureAst.updateSpecFile()
                },
            )
            r.RuleScenario('add new step in Scenario', (s) => {
                s.Given(
                    `{string} has {string} scenario`,
                    (_, featurePath: string, scenario: string) => {
                        const content = fs.readFileSync(featurePath).toString()

                        expect(content.includes(`Scenario: ${scenario}`)).toBe(
                            true,
                        )
                    },
                )
                s.When(
                    `I add a step in {string} for {string} scenario`,
                    async (
                        _,
                        featurePath: string,
                        scenario: string,
                        docString: string,
                    ) => {
                        fs.writeFileSync(featurePath, docString)
                        const feature = await loadFeature(featurePath)

                        expect(
                            feature.scenarii.find(
                                (s) => s.description === scenario,
                            )?.steps.length,
                        ).toBe(2)
                    },
                )
                s.Then(
                    `{string} scenario has {int} steps`,
                    async (_, scenario: string, count: number) => {
                        await featureAst.updateSpecFile()
                        const sourceFile = getSourceFileFromPath(specFilePath)

                        if (sourceFile) {
                            const call = getCallExpressionWithArg({
                                sourceFile,
                                text: 'Scenario',
                                arg: scenario,
                            })
                            expect(
                                call?.getDescendantsOfKind(
                                    SyntaxKind.CallExpression,
                                ).length,
                            ).toBe(count)
                        } else {
                            expect.fail('sourceFile should not be undefined')
                        }
                    },
                )
            })
            r.RuleScenario('remove a step in Scenario', (s) => {
                s.Given(
                    `'src/__tests__/awesome.feature' has "example" scenario`,
                    () => {},
                )
                s.When(
                    `I remove a step in "src/__tests__/awesome.feature" for "example" scenario`,
                    () => {},
                )
                s.Then(`"example" scenario has 1 step`, () => {})
            })
        })
    })
})
