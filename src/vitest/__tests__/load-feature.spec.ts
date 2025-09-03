import fs from 'node:fs/promises'
import { expect, test } from 'vitest'
import { FeatureFileNotFoundError, MissingFeature } from '../../errors/errors'
import { loadFeature, loadFeatureFromText } from '../load-feature'

test(`should be able to load feature file`, async () => {
    const feature = await loadFeature(`src/vitest/__tests__/example.feature`)
    const scenario = feature.getScenarioByName(`Example scenario`)

    if (!scenario) {
        test.fails(`scenario should not be undefined`)
        return
    }

    expect(feature.name).toBe(`vitest-cucumber`)
    expect(scenario.description).toEqual(`Example scenario`)
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
        await fs.unlink(featureFilePaht)
    }).not.toThrowError()
})

test('Handle error during parsing', async () => {
    const content = `
        Feature: another relative feature file
            Scénario: Detect relative path
                Given I use relative path
                When  I use vitest-cucumber
                Then  It can load me

    `
    const featureFilePaht = `${__dirname}/../../lang.feature`

    await fs.writeFile(featureFilePaht, content)

    try {
        await loadFeature(`../../lang.feature`, {
            language: 'fr',
        })
    } catch (e) {
        expect(e).toEqual(new MissingFeature('Scénario: Detect relative path'))
    }
    await fs.unlink(featureFilePaht)
})

test('Load feature by text', () => {
    const content = `
        Feature: another relative feature file
            Scenario: Detect relative path
                Given I use relative path
                When  I use vitest-cucumber
                Then  It can load me
    `

    const feature = loadFeatureFromText(content)

    expect(feature.scenarii.length).toBe(1)
    expect(feature.scenarii.at(0)?.steps.length).toBe(3)
})

test('Load feature by text with language', () => {
    const content = `
        Fonctionnalité: feature mais sans fichier
            Scénario: Detect relative path
                Etant donné que I use relative path
                Lorsque  I use vitest-cucumber
                Alors  It can load me
    `

    const feature = loadFeatureFromText(content, {
        language: 'fr',
    })

    expect(feature.scenarii.length).toBe(1)
    expect(feature.scenarii.at(0)?.steps.length).toBe(3)
})
