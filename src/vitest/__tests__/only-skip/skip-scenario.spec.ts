import { describe, expect, vi } from 'vitest'
import { FeatureContentReader } from '../../../__mocks__/FeatureContentReader.spec'
import { describeFeature } from '../../describe-feature'

describe('Scenario.skip', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Scenario.skip`,
        `   Scenario: skipped scenario`,
        `       Given I use skip`,
        ``,
    ]).parseContent()

    describeFeature(feature, (f) => {
        f.Scenario.skip('skipped scenario', (s) => {
            s.Given('I use skip', () => {
                expect.fail('should be skipped')
            })
        })
    })
})

describe('Scenario.only', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Scenario.only`,
        `   Scenario: uncalled scenario`,
        `       Given I am uncalled`,
        `   Scenario: only called scenario`,
        `       Given I use only`,
        ``,
    ]).parseContent()

    describeFeature(feature, (f) => {
        const fn = vi.fn()

        f.AfterAllScenarios(() => {
            expect(fn).toHaveBeenCalledTimes(1)
        })
        f.Scenario('uncalled scenario', (s) => {
            s.Given('I am uncalled', () => {
                expect.fail('should be skipped')
            })
        })
        f.Scenario.only('only called scenario', (s) => {
            s.Given('I use only', () => {
                fn()
            })
        })
    })
})
