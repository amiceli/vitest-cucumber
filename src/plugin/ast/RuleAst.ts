import { type ArrowFunction, SyntaxKind } from 'ts-morph'
import { generateRules } from '../../../scripts/generateFile'
import type { Feature, Rule } from '../../parser/models'
import { BackgroundAst } from './BackgroundAst'
import { type AstOptions, BaseAst, type VitestCallExpression } from './BaseAst'
import { ScenarioAst } from './ScenarioAst'

type ScenarioAstOptions = AstOptions & {
    ruleParent: Feature
    ruleParentFunction: ArrowFunction
}

export class RuleAst extends BaseAst {
    private ruleParent: Feature

    private ruleParentFunction: ArrowFunction

    private constructor(options: ScenarioAstOptions) {
        super(options)

        this.ruleParent = options.ruleParent
        this.ruleParentFunction = options.ruleParentFunction
    }

    public static fromOptions(options: ScenarioAstOptions): RuleAst {
        return new RuleAst(options)
    }

    public handleRules() {
        const rulesArrow = this.getRulesArrowFunction()

        const rulesToAdd = this.getMissingRules(rulesArrow)
        const rulesToRemove = this.getRulesToRemove(rulesArrow)

        for (const rule of rulesToRemove) {
            if (this.shouldComment) {
                this.commentExpression(
                    this.ruleParentFunction,
                    rule.callExpression,
                )
            } else {
                this.removeChildFromParent(
                    this.ruleParentFunction,
                    rule.callExpression,
                )
            }
        }

        this.ruleParentFunction.addStatements(generateRules(rulesToAdd || []))

        for (const rule of this.ruleParent.rules) {
            const ruleArrowFunction = this.getRuleArrowFunction(rule)

            if (ruleArrowFunction) {
                ScenarioAst.fromOptions({
                    ...this.options,
                    stepableParent: rule,
                    stepableParentFunction: ruleArrowFunction,
                    forRule: true,
                }).handleScenarii()
                BackgroundAst.fromOptions({
                    ...this.options,
                    stepableParent: rule,
                    stepableParentFunction: ruleArrowFunction,
                    forRule: true,
                }).handleBackground()

                this.updateRuleArgument(rule, ruleArrowFunction)
            }
        }
    }

    public updateRuleArgument(rule: Rule, ruleArrowFunction: ArrowFunction) {
        const ruleRequiredArgs: string[] = [
            rule.background ? 'RuleBackground' : undefined,
            rule.hasScenarioOutline ? 'RuleScenarioOutline' : undefined,
            rule.hasScenario ? 'RuleScenario' : undefined,
        ].filter((s) => s !== undefined)

        this.updateSyntaxListChild(ruleArrowFunction, ruleRequiredArgs)
    }

    private getRuleArrowFunction(rule: Rule): ArrowFunction | undefined {
        const list = this.getRulesArrowFunction()
        const scenarioFunction = list.find((s) => s.name === rule.name)

        if (scenarioFunction) {
            return scenarioFunction.callExpression
                .getArguments()
                .find((arg) => arg.isKind(SyntaxKind.ArrowFunction))
        }
    }

    private getRulesToRemove(
        parentScenarii: VitestCallExpression[],
    ): VitestCallExpression[] {
        return parentScenarii.filter((rule) => {
            return (
                rule.name &&
                this.ruleParent.rules.map((s) => s.name).includes(rule.name) ===
                    false
            )
        })
    }

    private getMissingRules(parentScenarii: VitestCallExpression[]): Rule[] {
        return this.ruleParent.rules.filter((scenario) => {
            return (
                parentScenarii.map((s) => s.name).includes(scenario.name) ===
                false
            )
        })
    }

    private getRulesArrowFunction(): VitestCallExpression[] {
        return this.callExpressionMatchRegExp(
            this.ruleParentFunction,
            /\bRule\(/,
        )
    }
}
