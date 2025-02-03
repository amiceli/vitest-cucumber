import { beforeAll, describe, expect, vi } from 'vitest'
import { FeatureContentReader } from '../../../__mocks__/FeatureContentReader.spec'
import { defineSteps, resetDefinedSteps } from '../../configuration'
import { describeFeature } from '../../describe-feature'

beforeAll(() => {
    resetDefinedSteps()
})

describe('Feature.defineSteps', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Feature.defineSteps`,
        `   Scenario: first scenario`,
        `       Given I am predefined step`,
        `       Then  I am called`,
        `   Scenario: second scenario`,
        `       Given I am predefined step`,
        `       Then  I am called twice`,
        ``,
    ]).parseContent()

    describeFeature(feature, (f) => {
        f.context.stepCallback = vi.fn()

        f.defineSteps(({ Given }) => {
            Given('I am predefined step', (ctx) => {
                f.context.stepCallback()
            })
        })

        f.Scenario('first scenario', (s) => {
            s.Then('I am called', () => {
                expect(f.context.stepCallback).toHaveBeenCalledTimes(1)
            })
        })
        f.Scenario('second scenario', (s) => {
            s.Then('I am called twice', () => {
                expect(f.context.stepCallback).toHaveBeenCalledTimes(2)
            })
        })
    })
})

describe('Rule.defineSteps', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Feature.defineSteps`,
        `   Scenario: first scenario`,
        `       Given I am predefined step`,
        `       Then  I am called`,
        `   Scenario Outline: first scenario outline`,
        `       Given I am predefined step <count>`,
        `       Then  I am called <count>`,
        `       Examples:`,
        `           | count |`,
        `           | 1     |`,
        `           | 2     |`,
        `   Rule: first rule`,
        `       Scenario: second scenario`,
        `           Given I am predefined step`,
        `           And   I am rule predefined step`,
        `           Then  I am called twice`,
        ``,
    ]).parseContent()

    describeFeature(feature, (f) => {
        f.context.stepCallback = vi.fn()

        f.defineSteps(({ Given }) => {
            Given('I am predefined step', (ctx) => {
                f.context.stepCallback()
            })
            Given('I am predefined step <count>', () => {
                expect(true).toBe(true)
            })
        })

        f.Scenario('first scenario', (s) => {
            s.Then('I am called', () => {
                expect(f.context.stepCallback).toHaveBeenCalledTimes(1)
            })
        })

        f.ScenarioOutline('first scenario outline', (s, variables) => {
            s.Then('I am called <count>', () => {
                expect([1, 2]).toContain(Number.parseInt(variables.count))
            })
        })

        f.Rule('first rule', (r) => {
            r.defineSteps(({ And, When }) => {
                And('I am rule predefined step', () => {
                    r.context.called = true
                })
                When('should be ignored', () => {
                    expect.fail('should not be called')
                })
            })
            r.RuleScenario('second scenario', (s) => {
                s.Then('I am called twice', () => {
                    expect(f.context.stepCallback).toHaveBeenCalledTimes(2)
                    expect(r.context.called).toBe(true)
                })
            })
        })
    })
})

describe('global.defineSteps', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Feature.defineSteps`,
        `   Scenario: first scenario`,
        `       Given I am predefined step`,
        `       And   I am global predefined step`,
        `       Then  I am called`,
        `   Scenario: second scenario`,
        `       Given I am predefined step`,
        `       And   I am global predefined step`,
        `       Then  I am called twice`,
        ``,
    ]).parseContent()

    const fn = vi.fn()

    defineSteps(({ And }) => {
        And('I am global predefined step', () => {
            fn()
        })
    })

    describeFeature(feature, (f) => {
        f.context.stepCallback = vi.fn()

        f.defineSteps(({ Given }) => {
            Given('I am predefined step', (ctx) => {
                f.context.stepCallback()
            })
        })

        f.Scenario('first scenario', (s) => {
            s.Then('I am called', () => {
                expect(f.context.stepCallback).toHaveBeenCalledTimes(1)
                expect(fn).toHaveBeenCalledTimes(1)
            })
        })
        f.Scenario('second scenario', (s) => {
            s.Then('I am called twice', () => {
                expect(f.context.stepCallback).toHaveBeenCalledTimes(2)
                expect(fn).toHaveBeenCalledTimes(2)
            })
        })
    })
})

describe('defineSteps with docStrings', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: DocStrings`,
        `    Scenario: DocStrings example`,
        `        Given I use DocStrings`,
        `            """`,
        `            DocStrings love me`,
        `            """`,
        `        When I run unit test`,
        `        Then I can read it`,
        `            """`,
        `            DocStrings love you`,
        `            """`,
    ]).parseContent()

    describeFeature(feature, (f) => {
        f.defineSteps(({ Given, Then }) => {
            Given('I use DocStrings', (ctx, docs) => {
                expect(docs).toEqual('DocStrings love me')
            })
            Then('I can read it', (_, docs: string) => {
                expect(docs).toEqual('DocStrings love you')
            })
        })
        f.Scenario('DocStrings example', (s) => {
            s.When('I run unit test', () => {
                expect(true).toBe(true)
            })
        })
    })
})
