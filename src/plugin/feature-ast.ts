import { Project, type SourceFile, SyntaxKind } from 'ts-morph'
import { generateScenarii } from '../../scripts/generateFile'
import type { Feature } from '../parser/models/feature'
import { FeatureFileReader } from '../parser/readfile'

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

        const sourceFile = this.project
            .getSourceFiles(options.specFilePath)
            .at(0)
        if (sourceFile) {
            this.sourceFile = sourceFile
        } else {
            throw new Error('sourcefile not found')
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

        this.finish()
    }

    private handleDescribeFeature() {
        if (!this.describeFeature) {
            this.sourceFile.addStatements([
                'describeFeature(feature, () => {',
                '   console.debug(true)',
                '})',
            ])
        }
    }

    private handleScenarii() {
        if (this.describeFeature) {
            const describeFeatureCallback = this.describeFeature
                .getArguments()
                .find((arg) => arg.isKind(SyntaxKind.ArrowFunction))

            if (describeFeatureCallback) {
                const scenarii = describeFeatureCallback
                    .getDescendantsOfKind(SyntaxKind.CallExpression)
                    .filter((call) => call.getText().includes('Scenario('))
                    .map((call) => {
                        return call
                            .getArguments()
                            .find((arg) => {
                                return this.stringTypes.includes(arg.getKind())
                            })
                            ?.getText()
                            .replace(/^['"`]|['"`]$/g, '')
                    })
                    .filter((scenario) => scenario !== undefined)

                const missingScenarii = this.feature?.scenarii.filter(
                    (scenario) => {
                        return scenarii.includes(scenario.description) === false
                    },
                )

                describeFeatureCallback.addStatements(
                    generateScenarii(missingScenarii || []),
                )
            }
        }
    }

    private finish() {
        this.sourceFile.formatText()
        // await this.sourceFile.save()

        console.debug(this.sourceFile.getText())
    }

    // getters

    private get describeFeature() {
        return this.sourceFile
            .getDescendantsOfKind(SyntaxKind.CallExpression)
            .find(
                (call) => call.getExpression().getText() === 'describeFeature',
            )
    }

    public get stringTypes() {
        return [
            SyntaxKind.StringLiteral,
            SyntaxKind.NoSubstitutionTemplateLiteral,
            SyntaxKind.TemplateExpression,
        ]
    }
}
