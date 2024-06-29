import { test, expect } from 'vitest'
import { loadFeature } from '../load-feature'
import { FeatureFileNotFoundError } from '../../errors/errors'
import fs from 'fs/promises'

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

test(`Check if feature file exists`, async () => {
    try {
        await loadFeature(`wrong-path.feature`)
    } catch (e) {
        expect(e).toEqual(
            new FeatureFileNotFoundError(`wrong-path.feature`).message,
        )
    }
})

test(`should be able to load file from relative path`, async () => {
    expect(async () => {
        await loadFeature(`./example.feature`)
    }).not.toThrowError()
})

test(`should be able to load file from relative path another example`, async () => {
    const content = `
        Feature: another relative feature file
            Scenario: Detect relative path
                Given I use relative path 
                When  I use vitest-cucumber
                Then  It can load me

    `
    const featureFilePaht = `${__dirname}/../../another.feature`

    await fs.writeFile(featureFilePaht, content)

    expect(async () => {
        await loadFeature(`../../another.feature`)
    }).not.toThrowError()

    await fs.unlink(featureFilePaht)
})
