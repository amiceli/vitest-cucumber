import fs from 'node:fs'
import { expect } from 'vitest'
import { describeFeature, loadFeature } from '../../../src/module'
import { FeatureAst } from '../feature-ast'

const feature = await loadFeature('src/plugin/__tests__/vitest-plugin.feature')

describeFeature(feature, ({ BeforeAllScenarios, Background, Scenario }) => {
    BeforeAllScenarios(() => {
        fs.rmSync('src/__tests__/awesome.spec.ts', { force: true })
        fs.rmSync('src/__tests__/awesome.feature', { force: true })
        fs.rmdirSync('src/__tests__/', { recursive: true })

        fs.mkdirSync('src/__tests__/')
        fs.writeFileSync('src/__tests__/awesome.spec.ts', '')
        fs.writeFileSync('src/__tests__/awesome.feature', '')
    })

    let featureFilePath: string
    let specFilePath: string
    let featureAst: FeatureAst

    Background(({ Given, And }) => {
        Given(
            `My feature files are in {string}`,
            (ctx, featurePath: string) => {
                featureFilePath = featurePath
            },
        )
        And(`My spec files are in {string}`, (ctx, specPath: string) => {
            specFilePath = specPath
            // expect(fs.readdirSync('src/__tests__/')).toEqual([
            //     'awesome.feature',
            //     'awesome.spec.ts',
            // ])
            featureAst = FeatureAst.fromOptions({
                specFilePath: 'src/__tests__/awesome.spec.ts',
                featureFilePath: 'src/__tests__/awesome.feature',
            })
        })
    })

    Scenario(
        `Create spec file for new feature file`,
        ({ Given, When, Then }) => {
            Given(`{string} doesn't exists`, (ctx, specPath: string) => {
                expect(fs.readFileSync(specPath).toString()).toEqual('')
            })
            When(`I write {string}`, (ctx, faturePath: string) => {
                const content = [
                    'Feature: test',
                    '   Scenario: example',
                    '       Given I am a step',
                ].join('\n')
                fs.writeFileSync(faturePath, content)
            })
            Then(
                `vitest-cucumber create {string}`,
                async (ctx, specPath: string) => {
                    await featureAst.updateSpecFile()
                    const content = fs.readFileSync(specPath).toString()

                    expect(content.includes('Scenario(`example`')).toBe(true)
                    expect(content.includes('Given(`I am a step`')).toBe(true)
                },
            )
        },
    )
    Scenario(`Add scenario to spec file`, ({ Given, When, Then }) => {
        Given(`"src/__tests__/awesome.spec.ts" hasn't scenario`, () => {})
        When(`I add a scenario into "src/__tests__/awesome.feature"`, () => {})
        Then(
            `vitest-cucumber add new scenario in "src/__tests__/awesome.spec.ts"`,
            () => {},
        )
    })
    Scenario(`Remove scenario in feature file`, ({ Given, When, Then }) => {
        Given(`"src/__tests__/awesome.feature" as "example" scenario`, () => {})
        When(`I remove "example" scenario in feature file`, () => {})
        Then(
            `vitest-cucumber remove "example" scenario in "src/__tests__/awesome.spec.ts"`,
            () => {},
        )
    })
})
