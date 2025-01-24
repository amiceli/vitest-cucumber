import { describe, expect } from 'vitest'
import { FeatureContentReader } from '../../../../__mocks__/FeatureContentReader.spec'
import { describeFeature } from '../../../describe-feature'

describe('RuleBackground.skip', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: RuleBackground.skip`,
        `   Rule: skip my background`,
        `       Background:`,
        `           Given I use skip`,
        `       Scenario: next scenario`,
        `           Given I am alone`,
        ``,
    ]).parseContent()

    describeFeature(feature, (f) => {
        f.Rule('skip my background', (r) => {
            r.RuleBackground.skip((b) => {
                b.Given('I use skip', () => {
                    expect.fail('background should be skipeed')
                })
            })
            r.RuleScenario('next scenario', (s) => {
                s.Given('I am alone', () => {
                    expect(true).toBe(true)
                })
            })
        })
    })
})
