import { type TaskContext, describe, expect } from 'vitest'
import { FeatureContentReader } from '../../__mocks__/FeatureContentReader.spec'
import { StepAbleStepExpressionError } from '../../errors/errors'
import { Step, StepTypes } from '../../parser/step'
import { describeFeature } from '../describe-feature'

describe(`step with expressions`, () => {
    describe(`Scenario`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: Background run before scenario tests`,
            `    Scenario: scenario with expression`,
            `        Given I use "Vue" 3.2`,
            `        Then  I can't use Vue 2`,
            `        And   I use typescript for $2`,
        ]).parseContent()

        describeFeature(feature, (f) => {
            f.Scenario(`scenario with expression`, (s) => {
                s.Given(
                    `I use {string} {float}`,
                    (ctx: TaskContext, framework: string, version: number) => {
                        expect(framework).toEqual(`Vue`)
                        expect(version).toEqual(3.2)
                        expect(ctx.task.name).toEqual(`Given I use "Vue" 3.2`)
                    },
                )
                s.Then(
                    `I can't use Vue {number}`,
                    (ctx: TaskContext, version: number) => {
                        expect(version).toEqual(2)
                        expect(ctx.task.name).toEqual(`Then I can't use Vue 2`)
                    },
                )
                s.And(
                    `I use typescript for {number}`,
                    (ctx: TaskContext, num: number) => {
                        expect(num).toEqual(2)
                        expect(ctx.task.name).toEqual(
                            `And I use typescript for $2`,
                        )
                    },
                )
            })
        })

        expect(() => {
            describeFeature(feature, (f) => {
                f.Scenario(`scenario with expression`, (s) => {
                    s.Given(
                        `I use {number} {float}`,
                        (ctx, framework: string, version: number) => {
                            expect(framework).toEqual(`Vue`)
                            expect(version).toEqual(3.2)
                        },
                    )
                })
            })
        }).toThrowError(
            new StepAbleStepExpressionError(
                feature.scenarii[0],
                new Step(StepTypes.GIVEN, `I use {number} {float}`),
            ),
        )
    })
    describe(`With Background`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: Background run before scenario tests`,
            `   Background:`,
            `        Given I use "Vue" 3.2`,
            `    Scenario: simple scenario`,
            `        Then   I use typescript`,
        ]).parseContent()

        describeFeature(feature, (f) => {
            f.Background((b) => {
                b.Given(`I use "Vue" {float}`, (ctx, version: number) => {
                    expect(version).toEqual(3.2)
                    expect(ctx.task.name).toEqual(`Given I use "Vue" 3.2`)
                })
            })
            f.Scenario(`simple scenario`, (s) => {
                s.Then(`I use typescript`, () => {})
            })
        })
    })
    describe(`With Rules`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: Background run before scenario tests`,
            `   Rule: test`,
            `      Background:`,
            `           Given I use "Vue" 3.2`,
            `       Scenario: simple scenario`,
            `           Then   I use typescript`,
        ]).parseContent()

        describeFeature(feature, (f) => {
            f.Rule(`test`, (r) => {
                r.RuleBackground((b) => {
                    b.Given(`I use "Vue" {float}`, (ctx, version: number) => {
                        expect(version).toEqual(3.2)
                        expect(ctx.task.name).toEqual(`Given I use "Vue" 3.2`)
                    })
                })
                r.RuleScenario(`simple scenario`, (s) => {
                    s.Then(`I use typescript`, () => {})
                })
            })
        })
    })
    describe(`Scenario Outline`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: Background run before scenario tests`,
            `    Scenario Outline: scenario outline with expression`,
            `        Given I use "Vue" 3.2`,
            `        Then  I can't use <framework> 2`,
            `        And   Not work with variable`,
            ``,
            `        Examples:`,
            `            | framework |`,
            `            | Angular   |`,
        ]).parseContent()

        describeFeature(feature, (f) => {
            f.ScenarioOutline(
                `scenario outline with expression`,
                (s, variables) => {
                    s.Given(
                        `I use {string} {float}`,
                        (ctx, framework: string, version: number) => {
                            expect(framework).toEqual(`Vue`)
                            expect(version).toEqual(3.2)
                            expect(ctx.task.name).toEqual(
                                `Given I use "Vue" 3.2`,
                            )
                        },
                    )
                    s.Then(
                        `I can't use <framework> {number}`,
                        (ctx, version: number) => {
                            expect(variables.framework).toEqual(`Angular`)
                            expect(version).toEqual(2)
                            expect(ctx.task.name).toEqual(
                                `Then I can't use Angular 2`,
                            )
                        },
                    )
                    s.And(
                        `Not work with variable`,
                        (ctx: TaskContext, ...params: unknown[]) => {
                            expect(params.length).toBe(0)
                            expect(ctx.task.name).toEqual(
                                `And Not work with variable`,
                            )
                        },
                    )
                },
            )
        })

        expect(() => {
            describeFeature(feature, (f) => {
                f.ScenarioOutline(
                    `scenario outline with expression`,
                    (s, variables) => {
                        s.Given(
                            `I use {string} {float}`,
                            (ctx, framework: string, version: number) => {
                                expect(framework).toEqual(`Vue`)
                                expect(version).toEqual(3.2)
                            },
                        )
                        s.Then(
                            `I can't use {string} {number}`,
                            (ctx, frame: string, version: number) => {
                                expect(variables.framework).toEqual(`Angular`)
                                expect(frame).toEqual(`oo`)
                                expect(version).toEqual(2)
                            },
                        )
                        s.And(
                            `Not work with variable`,
                            (ctx, ...params: undefined[]) => {
                                expect(params.length).toBe(0)
                            },
                        )
                    },
                )
            })
        }).toThrowError(
            new StepAbleStepExpressionError(
                feature.scenarii[0],
                new Step(StepTypes.THEN, `I can't use {string} {number}`),
            ),
        )
    })
    describe(`{list}`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: Background run before scenario tests`,
            `    Scenario: scenario with expression`,
            `        Given I use "Vue" 3.2`,
            `        Then  I can't use React, Angular, Solid`,
        ]).parseContent()

        describeFeature(feature, (f) => {
            f.Scenario(`scenario with expression`, (s) => {
                s.Given(
                    `I use {string} {float}`,
                    (ctx: TaskContext, framework: string, version: number) => {
                        expect(framework).toEqual(`Vue`)
                        expect(version).toEqual(3.2)
                        expect(ctx.task.name).toEqual(`Given I use "Vue" 3.2`)
                    },
                )
                s.Then(
                    `I can't use {list}`,
                    (ctx: TaskContext, list: string[]) => {
                        expect(list.length).toEqual(3)
                        expect(list).toContain(`Angular`)
                        expect(list).toContain(`React`)
                        expect(list).toContain(`Solid`)
                        expect(ctx.task.name).toEqual(
                            `Then I can't use React, Angular, Solid`,
                        )
                    },
                )
            })
        })
    })
})
