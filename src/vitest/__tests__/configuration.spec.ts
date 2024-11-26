import { afterEach } from 'node:test'
import { type TaskContext, describe, expect, it, vi } from 'vitest'
import { FeatureContentReader } from '../../__mocks__/FeatureContentReader.spec'
import { Step, StepTypes } from '../../parser/models/step'
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
            includeTags: [],
            excludeTags: ['ignore'],
            onStepError: expect.any(Function),
        })
    })

    it('full configuration', () => {
        const fn = vi.fn()

        const config = {
            language: 'fr',
            includeTags: ['alpha'],
            excludeTags: ['beta'],
            onStepError: fn,
        }

        const newConfig = getVitestCucumberConfiguration(config)
        newConfig.onStepError({
            error: new Error(''),
            ctx: {} as TaskContext,
            step: new Step(StepTypes.THEN, 'test'),
        })

        expect(newConfig).toEqual({
            language: 'fr',
            includeTags: ['alpha'],
            excludeTags: ['beta'],
            onStepError: expect.any(Function),
        })
        expect(fn).toHaveBeenCalled()
    })
})

describe('setVitestCucumberConfiguration', () => {
    it('empty configuration should set the default configuration', () => {
        const config = {}

        setVitestCucumberConfiguration(config)

        expect(getVitestCucumberConfiguration()).toEqual({
            language: 'en',
            includeTags: [],
            excludeTags: ['ignore'],
            onStepError: expect.any(Function),
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
            includeTags: [],
            excludeTags: ['beta'],
            onStepError: expect.any(Function),
        })
    })

    it('override configuration defaults to empty configuration', () => {
        const fn = vi.fn()
        const config1 = {
            excludeTags: ['beta'],
            onStepError: fn,
        }

        const config2 = {
            language: 'fr',
        }

        setVitestCucumberConfiguration(config1)
        setVitestCucumberConfiguration(config2)

        const lastConfiguration = getVitestCucumberConfiguration()

        try {
            lastConfiguration.onStepError({
                error: new Error(''),
                ctx: {} as TaskContext,
                step: new Step(StepTypes.THEN, 'test'),
            })
        } catch {
            // nothing to handle
        }

        expect(fn).not.toHaveBeenCalled()
        expect(lastConfiguration).toEqual({
            language: 'fr',
            includeTags: [],
            excludeTags: ['ignore'],
            onStepError: expect.any(Function),
        })
    })
})

describe('env variables', () => {
    afterEach(() => {
        vi.unstubAllEnvs()
    })
    it('should handle env variable in default options', () => {
        vi.stubEnv('VITEST_INCLUDE_TAGS', 'test again')
        vi.stubEnv('VITEST_EXCLUDE_TAGS', 'ignore-e2e')

        const options = getVitestCucumberConfiguration()

        expect(options.includeTags).toContain('again')
        expect(options.includeTags).toContain('test')

        expect(options.excludeTags).toContain('ignore')
        expect(options.excludeTags).toContain('ignore-e2e')
    })
})
