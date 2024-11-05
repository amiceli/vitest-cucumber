import path from 'node:path'
import { Project, type SourceFile, SyntaxKind } from 'ts-morph'
import { generateScenarii } from '../../scripts/generateFile'
import type { Feature } from '../parser/models/feature'
import { FeatureFileReader } from '../parser/readfile'
import { getCallExpression, isString } from './ast/ast-utils'

type FeatureAstOptions = {
    specFilePath: string
    featureFilePath: string
}

export class FeatureAst {
    private options: FeatureAstOptions

    private feature: Feature | null = null

    private project = new Project({})

    private sourceFile: SourceFile

    private constructor(options: FeatureAstOptions) {
        this.options = options
        this.project.addSourceFilesAtPaths(options.specFilePath)

        const realSpecPath = path.resolve(process.cwd(), options.specFilePath)
        const sourceFile = this.project.getSourceFiles(realSpecPath).at(0)

        if (sourceFile) {
            this.sourceFile = sourceFile
        } else {
            throw new Error(`sourcefile not found : ${realSpecPath}`)
        }
    }

    public static fromOptions(options: FeatureAstOptions): FeatureAst {
        return new FeatureAst(options)
    }

    private async loadFeautreFromFile(): Promise<Feature> {
        const [feature] = await FeatureFileReader.fromPath({
            featureFilePath: this.options.featureFilePath,
            callerFileDir: null,
            options: { language: 'en' },
            // options: getVitestCucumberConfiguration(options),
        }).parseFile()

        return feature
    }

    public async updateSpecFile() {
        this.feature = await this.loadFeautreFromFile()

        this.handleDescribeFeature()
        this.handleScenarii()

        await this.finish()
    }

    private handleDescribeFeature() {
        if (!this.describeFeature) {
            this.sourceFile.addStatements([
                'describeFeature(feature, () => {',
                '})',
            ])
        }
    }

    private handleScenarii() {
        if (this.describeFeatureCallback) {
            const scenarii = this.describeFeatureCallback
                .getDescendantsOfKind(SyntaxKind.CallExpression)
                .filter((call) => call.getText().includes('Scenario('))
                .map((callExpression) => {
                    return {
                        name: callExpression
                            .getArguments()
                            .find((arg) => isString(arg.getKind()))
                            ?.getText()
                            .replace(/^['"`]|['"`]$/g, ''),
                        callExpression,
                    }
                })
                .filter((scenario) => scenario !== undefined)

            const missingScenarii = this.feature?.scenarii.filter(
                (scenario) => {
                    return (
                        scenarii
                            .map((s) => s.name)
                            .includes(scenario.description) === false
                    )
                },
            )
            const shouldBeRemoved = scenarii.filter((scenario) => {
                return (
                    scenario.name &&
                    this.feature?.scenarii
                        .map((s) => s.description)
                        .includes(scenario.name) === false
                )
            })
            for (const s of shouldBeRemoved) {
                this.describeFeatureCallback.removeStatement(
                    s.callExpression.getChildIndex(),
                )
            }

            this.describeFeatureCallback.addStatements(
                generateScenarii(missingScenarii || []),
            )
        }
    }

    private async finish() {
        this.sourceFile.formatText()
        await this.sourceFile.save()
    }

    // getters

    private get describeFeature() {
        return getCallExpression({
            sourceFile: this.sourceFile,
            text: 'describeFeature',
        })
    }

    private get describeFeatureCallback() {
        if (this.describeFeature) {
            return this.describeFeature
                .getArguments()
                .find((arg) => arg.isKind(SyntaxKind.ArrowFunction))
        }

        return undefined
    }
}
