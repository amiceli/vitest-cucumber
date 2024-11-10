import fs from 'node:fs'
import { expect } from 'vitest'
import {
    describeFeature,
    loadFeature,
    setVitestCucumberConfiguration,
} from '../../../../src/module'
import { AstUtils } from '../../ast/AstUtils'
import { FeatureAst } from '../../ast/FeatureAst'
import { getSourceFileFromPath } from '../spec-utils'

const feature = await loadFeature(
    'src/plugin/__tests__/lang/lang-ast.feature',
    { language: 'fr' },
)

describeFeature(
    feature,
    ({ Background, Scenario, AfterAllScenarios, BeforeAllScenarios }) => {
        let featureAst: FeatureAst
        let featureFilePath: string
        let specFilePath: string

        BeforeAllScenarios(() => {
            setVitestCucumberConfiguration({
                language: 'fr',
            })
        })

        AfterAllScenarios(() => {
            fs.rmSync(featureFilePath)
            fs.rmSync(specFilePath)
        })

        Background(({ Given, And }) => {
            Given(
                `Le fichier gherkin est {string}`,
                (_, featurePath: string) => {
                    featureFilePath = featurePath
                    fs.writeFileSync(featurePath, '')
                },
            )
            And(`Le fichier de tests est {string}`, (_, specPath: string) => {
                fs.writeFileSync(specPath, '')
                specFilePath = specPath

                featureAst = FeatureAst.fromOptions({
                    specFilePath: specPath,
                    featureFilePath,
                    onDeleteAction: 'comment',
                })
            })
        })

        Scenario('Ajouter une step à un scenario', (s) => {
            s.Given(
                'Le scénario a un {string}',
                async (_, stepName: string, docString: string) => {
                    fs.writeFileSync(featureFilePath, docString)
                    await featureAst.updateSpecFile()

                    expect(
                        AstUtils.fromSourceFile(
                            getSourceFileFromPath(specFilePath),
                        )
                            .listDescendantCallExpressions()
                            .matchExpressionName(stepName)
                            .getOne(),
                    ).not.toBeUndefined()
                },
            )
            s.When(`J'ajoute un "Then"`, async (_, docString: string) => {
                fs.writeFileSync(featureFilePath, docString)
                await featureAst.updateSpecFile()
            })
            s.Then('Le scénario "test" a 2 staps', () => {
                expect(
                    AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                        .listDescendantCallExpressions()
                        .matchExpressionName('Given')
                        .getOne(),
                ).not.toBeUndefined()
                expect(
                    AstUtils.fromSourceFile(getSourceFileFromPath(specFilePath))
                        .listDescendantCallExpressions()
                        .matchExpressionName('Then')
                        .getOne(),
                ).not.toBeUndefined()
            })
        })
    },
)
