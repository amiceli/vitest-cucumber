import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { type ArrowFunction, SyntaxKind } from 'ts-morph'
import { writeSpecFile } from '../../../scripts/generateFile'
import { VitestsCucumberError } from '../../errors/errors'
import type { Feature } from '../../parser/models/feature'
import { FeatureFileReader } from '../../parser/readfile'
import { getVitestCucumberConfiguration } from '../../vitest/configuration'
import { AstUtils } from './AstUtils'
import { BackgroundAst } from './BackgroundAst'
import { type AstOptions, BaseAst } from './BaseAst'
import { RuleAst } from './RuleAst'
import { ScenarioAst } from './ScenarioAst'

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
            options: getVitestCucumberConfiguration(),
        }).parseFile()

        return feature
    }

    public async updateSpecFile() {
        try {
            this.feature = await this.loadFeautreFromFile()
            await this.handleDescribeFeature()
            this.handleFeature()

            await this.formatAndSave()
            if (this.options.formatCommand) {
                const execPromise = promisify(exec)
                await execPromise(
                    `${this.options.formatCommand} ${this.options.specFilePath}`,
                )
            }
        } catch (e) {
            throw new VitestsCucumberError(
                `FeatureAst error: ${(e as Error).message}`,
            )
        }
    }

    private async handleDescribeFeature() {
        if (!this.describeFeature && this.feature) {
            await writeSpecFile({
                feature: this.feature,
                specFilePath: this.options.specFilePath,
                featureFilePath: this.options.featureFilePath,
            })
            this.resetProject()
        }
    }

    private handleFeature() {
        if (this.describeFeatureCallback && this.feature) {
            ScenarioAst.fromOptions({
                ...this.options,
                stepableParent: this.feature,
                stepableParentFunction: this.describeFeatureCallback,
            }).handleScenarii()
            RuleAst.fromOptions({
                ...this.options,
                ruleParent: this.feature,
                ruleParentFunction: this.describeFeatureCallback,
            }).handleRules()
            BackgroundAst.fromOptions({
                ...this.options,
                stepableParent: this.feature,
                stepableParentFunction: this.describeFeatureCallback,
            }).handleBackground()

            this.updateFeatureArguments(
                this.feature,
                this.describeFeatureCallback,
            )
        }
    }

    private updateFeatureArguments(
        feature: Feature,
        featureArrowFunction: ArrowFunction,
    ) {
        const featureRequiredArgs: string[] = [
            feature.background !== null ? 'Background' : undefined,
            feature.hasScenarioOutline ? 'ScenarioOutline' : undefined,
            feature.hasScenario ? 'Scenario' : undefined,
            feature.rules.length > 0 ? 'Rule' : undefined,
        ].filter((a) => a !== undefined)

        this.updateSyntaxListChild(featureArrowFunction, featureRequiredArgs)
    }

    private async formatAndSave() {
        this.sourceFile.formatText()
        await this.sourceFile.save()
    }

    private get describeFeature() {
        return AstUtils.fromSourceFile(this.sourceFile)
            .listDescendantCallExpressions()
            .matchExpressionName('describeFeature')
            .getOne()
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
