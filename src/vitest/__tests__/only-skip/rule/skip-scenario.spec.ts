import { describe, expect, vi } from 'vitest'
import { FeatureContentReader } from '../../../../__mocks__/FeatureContentReader.spec'
import { describeFeature } from '../../../describe-feature'

describe('RuleScenario.skip', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: RuleScenario.skip`,
        `   Rule: rule with skipped scenario`,
        `       Scenario: skipped scenario`,
        `           Given I use skip`,
        ``,
    ]).parseContent()

    describeFeature(feature, (f) => {
        f.Rule('rule with skipped scenario', (r) => {
            r.RuleScenario.skip('skipped scenario', (s) => {
                s.Given('I use skip', () => {
                    expect.fail('should be skipped')
                })
            })
        })
    })
})

describe('RuleScenario.only', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: RuleScenario.only`,
        `   Rule: rule with alone scenario`,
        `       Scenario: uncalled rule scenario`,
        `           Given I am uncalled`,
        `       Scenario: only called rule scenario`,
        `           Given I use only`,
        ``,
    ]).parseContent()

    describeFeature(feature, (f) => {
        const fn = vi.fn()

        f.AfterAllScenarios(() => {
            expect(fn).toHaveBeenCalledTimes(1)
        })

        f.Rule('rule with alone scenario', (r) => {
            r.RuleScenario('uncalled rule scenario', (s) => {
                s.Given('I am uncalled', () => {
                    expect.fail('should be skipped')
                })
            })
            r.RuleScenario.only('only called rule scenario', (s) => {
                s.Given('I use only', () => {
                    fn()
                })
            })
        })
    })
})
