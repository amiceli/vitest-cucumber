import { describe, expect, vi } from 'vitest'
import { FeatureContentReader } from '../../../../__mocks__/FeatureContentReader.spec'
import { describeFeature } from '../../../describe-feature'

describe('Rule.skip', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Rule.skip`,
        `   Rule: skipped rule`,
        `       Scenario: skipped scenario`,
        `           Given I use skip`,
        ``,
    ]).parseContent()

    describeFeature(feature, (f) => {
        f.Rule.skip('skipped rule', (r) => {
            r.RuleScenario('skipped scenario', (s) => {
                s.Given('I use skip', () => {
                    expect.fail('should be skipped')
                })
            })
        })
    })
})

describe('Rule.only', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Rule.only`,
        `   Rule: called rule`,
        `       Scenario: called rule scenario`,
        `           Given I am called`,
        `   Rule: uncalled rule`,
        `       Scenario: uncalled rule scenario`,
        `           Given I am uncalled`,
        ``,
    ]).parseContent()

    describeFeature(feature, (f) => {
        const fn = vi.fn()

        f.AfterAllScenarios(() => {
            expect(fn).toHaveBeenCalledTimes(1)
        })

        f.Rule.only('called rule', (r) => {
            r.RuleScenario('called rule scenario', (s) => {
                s.Given('I am called', () => {
                    fn()
                })
            })
        })
        f.Rule('uncalled rule', (r) => {
            r.RuleScenario('uncalled rule scenario', (s) => {
                s.Given('I am uncalled', () => {
                    expect.fail('should be skipped')
                })
            })
        })
    })
})
