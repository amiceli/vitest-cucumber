import { SyntaxKind } from 'ts-morph'
import type { Feature } from '../../parser/models/feature'
import { FeatureFileReader } from '../../parser/readfile'
import { BackgroundAst } from './BackgroundAst'
import { type AstOptions, BaseAst } from './BaseAst'
import { RuleAst } from './RuleAst'
import { ScenarioAst } from './ScenarioAst'
import { getCallExpression } from './ast-utils'

export class FeatureAst extends BaseAst {
    private feature: Feature | null = null

    private constructor(options: AstOptions) {
        super(options)
    }

    public static fromOptions(options: AstOptions): FeatureAst {
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
        if (this.describeFeatureCallback && this.feature) {
            ScenarioAst.fromOptions({
                ...this.options,
                scenarioParent: this.feature,
                scenarioParentFunction: this.describeFeatureCallback,
            }).handleScenarii()
            RuleAst.fromOptions({
                ...this.options,
                ruleParent: this.feature,
                ruleParentFunction: this.describeFeatureCallback,
            }).handleRules()
            BackgroundAst.fromOptions({
                ...this.options,
                backgroundParent: this.feature,
                backgroundParentFunction: this.describeFeatureCallback,
            }).handleBackground()
        }
    }

    private async finish() {
        this.sourceFile.formatText()
        await this.sourceFile.save()
    }

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
