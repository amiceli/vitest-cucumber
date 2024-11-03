import fs from 'node:fs'
import { expect } from 'vitest'
import { describeFeature, loadFeature } from '../../../src/module'
import { FeatureAst } from '../feature-ast'

const feature = await loadFeature('src/plugin/__tests__/vitest-plugin.feature')

describeFeature(feature, ({ BeforeAllScenarios, Background, Scenario }) => {
    BeforeAllScenarios(() => {
        fs.rmSync('src/__tests__/awesome.spec.ts', { force: true })
        fs.rmSync('src/__tests__/awesome.feature', { force: true })
        fs.rmSync('src/__tests__/', { recursive: true })

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
            featureAst = FeatureAst.fromOptions({
                specFilePath: 'src/__tests__/awesome.spec.ts',
                featureFilePath: 'src/__tests__/awesome.feature',
            })
        })
    })

    Scenario(`Add scenario to spec file`, ({ Given, When, Then }) => {
        Given(`{string} hasn't scenario`, (ctx, specPath: string) => {
            fs.writeFileSync(specPath, '')
        })
        When(
            `I add a scenario into {string}`,
            (ctx, featurePath: string, docsString: string) => {
                fs.writeFileSync(featurePath, docsString)
            },
        )
        Then(
            `vitest-cucumber add new scenario in {string}`,
            async (ctx, specPath: string) => {
                await featureAst.updateSpecFile()
                const content = fs.readFileSync(specPath).toString()

                expect(content.includes('Scenario(`new scenario`')).toBe(true)
            },
        )
    })
    Scenario(`Remove scenario in feature file`, ({ Given, When, Then }) => {
        Given(
            '{string} has {string} scenario',
            async (ctx, featurePath: string, name: string) => {
                fs.writeFileSync('src/__tests__/awesome.spec.ts', '')
                fs.writeFileSync(
                    featurePath,
                    [
                        'Feature: test',
                        `   Scenario: ${name}`,
                        '       Given I am a step',
                        `   Scenario: another`,
                        '       Given I am a step again',
                    ].join('\n'),
                )
                await featureAst.updateSpecFile()
            },
        )
        When(
            `I remove {string} scenario in {string}`,
            async (ctx, scenario: string, featurePath: string) => {
                fs.writeFileSync(
                    featurePath,
                    [
                        'Feature: test',
                        `   Scenario: another`,
                        '       Given I am a stepagain',
                    ].join('\n'),
                )
                await featureAst.updateSpecFile()
            },
        )
        Then(
            `vitest-cucumber remove {string} scenario in {string}`,
            (ctx, scenario: string, spcedFile: string) => {
                const content = fs.readFileSync(spcedFile).toString()
                console.debug({
                    content,
                })

                expect(content.includes(`Scenario(\`${scenario}\``)).toBe(false)
                expect(content.includes(`another`)).toBe(true)
            },
        )
    })
})
