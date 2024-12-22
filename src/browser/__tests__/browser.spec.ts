import { beforeEach, expect, it, vi } from 'vitest'
import { getVitestCucumberConfiguration } from '../../vitest/configuration'
import { BrowserFeatureFileReader } from '../readfile'

beforeEach(() => {
    vi.resetAllMocks()
})

it('should load config from impot.meta.env', () => {
    // @ts-ignore
    globalThis.window = {}

    vi.stubEnv('VITEST_INCLUDE_TAGS', 'awesome')
    vi.stubEnv('VITEST_EXCLUDE_TAGS', 'ignore-e2e')

    const config = getVitestCucumberConfiguration()

    expect(config.excludeTags).toContain('ignore-e2e')
    expect(config.excludeTags).toContain('ignore')
    expect(config.includeTags).toContain('awesome')
})

it('should be able to fetch featuee file', async () => {
    const featureFilePath = 'awesome.feature'
    const reader = BrowserFeatureFileReader.fromPath({
        featureFilePath,
        options: getVitestCucumberConfiguration(),
    })

    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () =>
            Promise.resolve(`
            Feature: awesome
                Scenario: simple scenario
                    Given I use browser mode
                    Then I use fetch
        `),
    })

    const [feature] = await reader.parseFile()

    expect(global.fetch).toHaveBeenCalledWith(`/${featureFilePath}`)

    expect(feature.name).toBe('awesome')
    expect(feature.scenarii.length).toBe(1)
})
