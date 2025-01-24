import { describe, expect, vi } from 'vitest'
import { FeatureContentReader } from '../../../__mocks__/FeatureContentReader.spec'
import type { ScenarioOutline } from '../../../parser/models'
import { describeFeature } from '../../describe-feature'

describe('ScenarioOutline.skip', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Scenario.skip`,
        `   Scenario Outline: skipped scenario outline`,
        `       Given My name is <name>`,
        `       Examples:`,
        `           | name |`,
        `           | Luigi|`,
        `           | Mario |`,
        ``,
    ]).parseContent()

    describeFeature(feature, (f) => {
        f.ScenarioOutline.skip('skipped scenario outline', (s) => {
            s.Given('My name is <name>', () => {
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
        `   Scenario Outline: called scenario outline`,
        `       Given My favorite game is <game>`,
        `       Examples:`,
        `           | game     |`,
        `           | GTA      |`,
        `           | AC Unity |`,
        ``,
    ]).parseContent()

    describeFeature(feature, (f) => {
        const fn = vi.fn()

        f.AfterAllScenarios(() => {
            expect(fn).toHaveBeenCalledTimes(
                (feature.scenarii.at(1) as ScenarioOutline)?.examples.length ||
                    0,
            )
        })
        f.Scenario('uncalled scenario', (s) => {
            s.Given('I am uncalled', () => {
                expect.fail('should be skipped')
            })
        })
        f.ScenarioOutline.only('called scenario outline', (s, variables) => {
            s.Given('My favorite game is <game>', () => {
                expect(['GTA', 'AC Unity']).toContain(variables.game)
                fn()
            })
        })
    })
})
