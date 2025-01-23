import { describe, expect } from 'vitest'
import { FeatureContentReader } from '../../__mocks__/FeatureContentReader.spec'
import { describeFeature } from '../describe-feature'

describe('skip Scneario', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: detect if scenario is outline`,
        `   Scenario: Simple scenario`,
        `       Given I use skip`,
        `       Then  This scenario is skipped`,
        ``,
    ]).parseContent()

    describeFeature(feature, (f) => {
        f.Scenario.skip('Simple scenario', (s) => {
            s.Given('I use skip', () => {
                expect.fail('should be skipped')
            })
            s.Then('This scenario is skipped', () => {})
        })
    })
})

describe('only one Scneario', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: detect if scenario is outline`,
        `   Scenario: Simple scenario`,
        `       Given I am a scenario`,
        `       Then  I am skipped`,
        `   Scenario: another scenario`,
        `       Given I use onlu`,
        `       Then  Other scenario is ignored`,
        ``,
    ]).parseContent()

    describeFeature(feature, (f) => {
        f.Scenario('Simple scenario', (s) => {
            s.Given('I am a scenario', () => {
                expect.fail('should be skipped')
            })
            s.Then('I am skipped', () => {})
        })
        f.Scenario.only('another scenario', (s) => {
            s.Given('I use onlu', () => {})
            s.Then('Other scenario is ignored', () => {
                expect(true).toBe(true)
            })
        })
    })
})
