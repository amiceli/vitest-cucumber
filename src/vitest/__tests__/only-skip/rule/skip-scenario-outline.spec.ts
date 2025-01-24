import { describe, expect, vi } from 'vitest'
import { FeatureContentReader } from '../../../../__mocks__/FeatureContentReader.spec'
import type { ScenarioOutline } from '../../../../parser/models'
import { describeFeature } from '../../../describe-feature'

describe('RuleScenarioOutline.skip', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: RuleScenarioOutline.skip`,
        `   Rule: skipped rule scenario outline`,
        `   Scenario Outline: skipped scenario outline`,
        `        Given My name is <name>`,
        `        Examples:`,
        `            | name |`,
        `            | Luigi|`,
        `            | Mario |`,
        ``,
    ]).parseContent()

    describeFeature(feature, (f) => {
        f.Rule('skipped rule scenario outline', (r) => {
            r.RuleScenarioOutline.skip('skipped scenario outline', (s) => {
                s.Given('My name is <name>', () => {
                    expect.fail('should be skipped')
                })
            })
        })
    })
})

describe('RuleScenarioOutline.only', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: RuleScenarioOutline.only`,
        `   Rule: only rule scenario outline`,
        `       Scenario: uncalled scenario`,
        `           Given I am uncalled`,
        `       Scenario Outline: called scenario outline`,
        `           Given My favorite game is <game>`,
        `           Examples:`,
        `               | game     |`,
        `               | GTA      |`,
        `               | AC Unity |`,
        ``,
    ]).parseContent()

    describeFeature(feature, (f) => {
        const fn = vi.fn()

        f.AfterAllScenarios(() => {
            expect(fn).toHaveBeenCalledTimes(
                (feature.rules.at(0)?.scenarii.at(1) as ScenarioOutline)
                    ?.examples.length || 0,
            )
        })

        f.Rule('only rule scenario outline', (r) => {
            r.RuleScenario('uncalled scenario', (s) => {
                s.Given('I am uncalled', () => {
                    expect.fail('should be skipped')
                })
            })
            r.RuleScenarioOutline.only(
                'called scenario outline',
                (s, variables) => {
                    s.Given('My favorite game is <game>', () => {
                        expect(['GTA', 'AC Unity']).toContain(variables.game)
                        fn()
                    })
                },
            )
        })
    })
})
