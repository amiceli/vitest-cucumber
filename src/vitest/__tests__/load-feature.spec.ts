import { test, expect } from 'vitest'
import { loadFeature, loadFeatures } from '../load-feature'

test(`should be able to load feature file`, async () => {
    const feature = await loadFeature(`src/vitest/__tests__/example.feature`)
    const scenario = feature.getScenarioByName(`Example scenario`)

    if (!scenario) {
        test.fails(`scenario should not be undefined`)
        return
    }
    expect(feature.name).toBe(`vitest-cucumber`)
    expect(
        scenario.description,
    ).toEqual(`Example scenario`)
    expect(scenario.steps.length).toBe(3)
})

test(`should be able to load features file`, async () => {
    const features = await loadFeatures(`src/vitest/__tests__/example.feature`)
    const [firstFeature, secondFeature] = features

    expect(features.length).toBe(2)
    expect(firstFeature.name).toBe(`vitest-cucumber`)
    expect(secondFeature.name).toBe(`another vitest-cucumber feature`)
})