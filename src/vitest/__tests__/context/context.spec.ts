import { describe, expect } from 'vitest'
import { FeatureContentReader } from '../../../__mocks__/FeatureContentReader.spec'
import { describeFeature } from '../../describe-feature'
import type { FeatureDescriibeCallbackParams, StepTest } from '../../types'

describe('Scenario.context', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Scenario.context`,
        `   Background:`,
        `       Given I have a background context`,
        `   Scenario: use scenario context`,
        `       Given I have a scenario context`,
        `       When  I update scenario context`,
        `       Then  I can check it`,
        ``,
    ]).parseContent()

    type AwesomeContext = {
        updated: boolean
    }

    function defineGiven(steppable: StepTest<AwesomeContext>) {
        steppable.Given('I have a scenario context', () => {
            expect(steppable.context).toEqual({
                updated: false,
            })
        })
    }

    function defineWhen(steppable: StepTest<AwesomeContext>) {
        steppable.When('I update scenario context', () => {
            steppable.context.updated = true
        })
    }

    describeFeature(feature, (f) => {
        f.Background((b) => {
            b.Given('I have a background context', () => {
                expect(b.context).toEqual({})
            })
        })
        f.Scenario('use scenario context', (s: StepTest<AwesomeContext>) => {
            s.context.updated = false
            defineGiven(s)
            defineWhen(s)
            s.Then('I can check it', () => {
                expect(s.context.updated).toBe(true)
            })
        })
    })
})

describe('Feature.context', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Feature.context`,
        `    Background:`,
        `        Given I have a feature-background context`,
        `   Rule: rule with context`,
        `       Background:`,
        `           Given I have a rule-background context`,
        `       Scenario Outline: use scenario context`,
        `           Given I have a scenario context property <name>`,
        `           Then  I can check its <value>`,
        ``,
        `           Examples:`,
        `               | name     | value   |`,
        `               | name     | Toni    |`,
        `               | name     | Montana |`,
        ``,
    ]).parseContent()

    describeFeature(
        feature,
        (f: FeatureDescriibeCallbackParams<{ value: number }>) => {
            f.BeforeAllScenarios(() => {
                f.context.value = 0
            })
            f.BeforeEachScenario(() => {
                f.context.value += 1
            })
            f.AfterAllScenarios(() => {
                expect(f.context).toEqual({ value: 2 })
            })
            f.Background((b) => {
                b.Given('I have a feature-background context', () => {
                    expect(b.context).toEqual({})
                })
            })
            f.Rule('rule with context', (r) => {
                r.RuleBackground((b) => {
                    b.Given('I have a rule-background context', () => {
                        expect(b.context).toEqual({})

                        r.context.isRule = true
                    })
                    type Variables = { name: string; value: string }
                    type CustomContext = { name: string }
                    r.RuleScenarioOutline(
                        'use scenario context',
                        (s: StepTest<CustomContext>, variables) => {
                            const v = variables as Variables
                            s.Given(
                                'I have a scenario context property <name>',
                                () => {
                                    s.context[v.name] = v.value
                                },
                            )
                            s.Then('I can check its <value>', () => {
                                expect(s.context.name).toEqual(v.value)
                                expect(r.context.isRule).toBe(true)
                            })
                        },
                    )
                })
            })
        },
    )
})
