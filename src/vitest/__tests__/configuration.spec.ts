import { describe, expect, it } from 'vitest'
import { FeatureContentReader } from '../../__mocks__/FeatureContentReader.spec'
import {
    getVitestCucumberConfiguration,
    setVitestCucumberConfiguration,
} from '../configuration'
import { describeFeature } from '../describe-feature'

describe(`Ignore scenario with @ignore tag by default`, () => {
    const feature = FeatureContentReader.fromString([
        `Feature: detect uncalled rules`,
        `    Scenario: Simple scenario`,
        `        Given vitest-cucumber is running`,
        `        Then  It check I am executed`,
        `    @ignore`,
        `    Scenario: Ignored scenario`,
        `        Given vitest-cucumber is running`,
        `        Then  Don't check if I am called    `,
    ]).parseContent()

    describeFeature(feature, ({ Scenario, AfterAllScenarios }) => {
        AfterAllScenarios(() => {
            expect(
                feature.getScenarioByName(`Ignored scenario`)?.isCalled,
            ).toBe(false)
            expect(
                feature
                    .getScenarioByName(`Ignored scenario`)
                    ?.matchTags([`ignore`]),
            ).toBe(true)
        })
        Scenario(`Simple scenario`, ({ Given, Then }) => {
            Given(`vitest-cucumber is running`, () => {})
            Then(`It check I am executed`, () => {})
        })
    })
})

describe('getVitestCucumberConfiguration', () => {
    it('default configuration', () => {
        expect(getVitestCucumberConfiguration()).toEqual({
            language: 'en',
            excludeTags: ['ignore'],
        })
    })

    it('full configuration', () => {
        const config = {
            language: 'fr',
            excludeTags: ['beta'],
        }

        expect(getVitestCucumberConfiguration(config)).toEqual({
            language: 'fr',
            excludeTags: ['beta'],
        })
    })
})

describe('setVitestCucumberConfiguration', () => {
    it('empty configuration should set the default configuration', () => {
        const config = {}

        setVitestCucumberConfiguration(config)

        expect(getVitestCucumberConfiguration()).toEqual({
            language: 'en',
            excludeTags: ['ignore'],
        })
    })

    it('custom configuration', () => {
        const config = {
            language: 'fr',
            excludeTags: ['beta'],
        }

        setVitestCucumberConfiguration(config)

        expect(getVitestCucumberConfiguration()).toEqual({
            language: 'fr',
            excludeTags: ['beta'],
        })
    })

    it('override configuration defaults to empty configuration', () => {
        const config1 = {
            excludeTags: ['beta'],
        }

        const config2 = {
            language: 'fr',
        }

        setVitestCucumberConfiguration(config1)
        setVitestCucumberConfiguration(config2)

        expect(getVitestCucumberConfiguration()).toEqual({
            language: 'fr',
            excludeTags: ['ignore'],
        })
    })
})
