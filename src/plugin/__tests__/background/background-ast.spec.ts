import fs from 'node:fs'
import { expect } from 'vitest'
import { describeFeature, loadFeature } from '../../../../src/module'
import { FeatureAst } from '../../ast/FeatureAst'
import { getCallExpression, getSourceFileFromPath } from '../../ast/ast-utils'

const feature = await loadFeature(
    'src/plugin/__tests__/background/background-ast.feature',
)

describeFeature(feature, ({ Background, Scenario }) => {
    let featureAst: FeatureAst
    let featureFilePath: string
    let specFilePath: string

    Background(({ Given, And }) => {
        Given(`My feature file is {string}`, (_, featurePath: string) => {
            featureFilePath = featurePath
            fs.writeFileSync(featurePath, '')
        })
        And(`My spec file is {string}`, (_, specPath: string) => {
            fs.writeFileSync(specPath, '')
            specFilePath = specPath

            featureAst = FeatureAst.fromOptions({
                specFilePath: specPath,
                featureFilePath,
            })
        })
    })

    Scenario(`Add Background in Feautre`, ({ Given, When, Then }) => {
        Given(`Feature has no Background`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                getCallExpression({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Background',
                }),
            ).toBeUndefined()
        })
        When(`I add a Background in Feature`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()
        })
        Then(`vitest-cucumber add a Background in Feature`, () => {
            expect(
                getCallExpression({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Background',
                }),
            ).not.toBeUndefined()
        })
    })

    Scenario(`Remove Background in Feature`, ({ Given, When, Then }) => {
        Given(`Feature has a Background`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                getCallExpression({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Background',
                }),
            ).not.toBeUndefined()
        })
        When(
            `I remove Background from Feature`,
            async (_, docString: string) => {
                fs.writeFileSync(featureFilePath, docString)
                await featureAst.updateSpecFile()
            },
        )
        Then(`vitest-cucumber remove Background in Feature`, () => {
            expect(
                getCallExpression({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'Background',
                }),
            ).toBeUndefined()
        })
    })

    Scenario(`Add Background in Rule`, ({ Given, When, Then }) => {
        Given(`Rule has no Background`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                getCallExpression({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'RuleBackground',
                }),
            ).toBeUndefined()
        })
        When(`I add a Background in Rule`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()
        })
        Then(`vitest-cucumber add a Background in Rule`, () => {
            expect(
                getCallExpression({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'RuleBackground',
                }),
            ).not.toBeUndefined()
        })
    })

    Scenario(`Remove Background in Rule`, ({ Given, When, Then }) => {
        Given(`Rule has Background`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()

            expect(
                getCallExpression({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'RuleBackground',
                }),
            ).not.toBeUndefined()
        })
        When(`I remove Background from Rule`, async (_, docString: string) => {
            fs.writeFileSync(featureFilePath, docString)
            await featureAst.updateSpecFile()
        })
        Then(`vitest-cucumber remove Background from Rule`, () => {
            expect(
                getCallExpression({
                    sourceFile: getSourceFileFromPath(specFilePath),
                    text: 'RuleBackground',
                }),
            ).toBeUndefined()
        })
    })
})
