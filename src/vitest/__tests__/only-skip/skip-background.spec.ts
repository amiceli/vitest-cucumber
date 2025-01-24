import { describe, expect } from 'vitest'
import { FeatureContentReader } from '../../../__mocks__/FeatureContentReader.spec'
import { describeFeature } from '../../describe-feature'

describe('Background.skip', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Scenario.skip`,
        `   Background:`,
        `       Given I use skip`,
        `   Scenario: next scenario`,
        `       Given I am alone`,
        ``,
    ]).parseContent()

    describeFeature(feature, (f) => {
        f.Background.skip((b) => {
            b.Given('I use skip', () => {
                expect.fail('background should be skipeed')
            })
        })
        f.Scenario('next scenario', (s) => {
            s.Given('I am alone', () => {
                expect(true).toBe(true)
            })
        })
    })
})
