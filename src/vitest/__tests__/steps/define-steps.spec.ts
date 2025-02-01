import { describe, expect, vi } from 'vitest'
import { FeatureContentReader } from '../../../__mocks__/FeatureContentReader.spec'
import { describeFeature } from '../../describe-feature'

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
