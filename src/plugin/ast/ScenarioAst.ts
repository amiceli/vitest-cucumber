import { type ArrowFunction, SyntaxKind } from 'ts-morph'
import { generateScenarii } from '../../../scripts/generateFile'
import type { Scenario, ScenarioParent } from '../../parser/models'
import { type AstOptions, BaseAst, type VitestCallExpression } from './BaseAst'
import { StepAst } from './StepAst'

type ScenarioAstOptions = AstOptions & {
    scenarioParent: ScenarioParent
    scenarioParentFunction: ArrowFunction
    forRule?: boolean
}

export class ScenarioAst extends BaseAst {
    private scenarioParent: ScenarioParent

    private scenarioParentFunction: ArrowFunction

    private readonly forRule: boolean

    private constructor(options: ScenarioAstOptions) {
        super(options)

        this.scenarioParent = options.scenarioParent
        this.scenarioParentFunction = options.scenarioParentFunction
        this.forRule = options.forRule === true
    }

    public static fromOptions(options: ScenarioAstOptions): ScenarioAst {
        return new ScenarioAst(options)
    }

    public handleScenarii() {
        const scenariiArrow = this.getScenariiArrowFunction()

        const scenariiToAdd = this.getMissingScenarri(scenariiArrow)
        const scenariiToRemove = this.getScenariiToRemove(scenariiArrow)

        for (const s of scenariiToRemove) {
            if (this.shouldComment) {
                this.commentExpression(
                    this.scenarioParentFunction,
                    s.callExpression,
                )
            } else {
                this.removeChildFromParent(
                    this.scenarioParentFunction,
                    s.callExpression,
                )
            }
        }

        this.scenarioParentFunction.addStatements(
            generateScenarii(scenariiToAdd || [], this.forRule),
        )

        for (const scenario of this.scenarioParent.scenarii) {
            const scenarioArrowFunction =
                this.getScenarioArrowFunction(scenario)

            if (scenarioArrowFunction) {
                StepAst.fromOptions({
                    ...this.options,
                    stepParent: scenario,
                    stepParentFunction: scenarioArrowFunction,
                }).handleSteps()
            }
        }
    }

    private getScenarioArrowFunction(
        scenario: Scenario,
    ): ArrowFunction | undefined {
        const list = this.getScenariiArrowFunction()
        const scenarioFunction = list.find(
            (s) => s.name === scenario.description,
        )

        if (scenarioFunction) {
            return scenarioFunction.callExpression
                .getArguments()
                .find((arg) => arg.isKind(SyntaxKind.ArrowFunction))
        }
    }

    private getScenariiToRemove(
        parentScenarii: VitestCallExpression[],
    ): VitestCallExpression[] {
        return parentScenarii.filter((scenario) => {
            return (
                scenario.name &&
                this.scenarioParent.scenarii
                    .map((s) => s.description)
                    .includes(scenario.name) === false
            )
        })
    }

    private getMissingScenarri(
        parentScenarii: VitestCallExpression[],
    ): Scenario[] {
        return this.scenarioParent.scenarii.filter((scenario) => {
            return (
                parentScenarii
                    .map((s) => s.name)
                    .includes(scenario.description) === false
            )
        })
    }

    private getScenariiArrowFunction(): VitestCallExpression[] {
        return this.callExpressionMatchRegExp(
            this.scenarioParentFunction,
            this.forRule
                ? /\b(RuleScenario|RuleScenarioOutline)\(/
                : /\b(Scenario|ScenarioOutline)\(/,
        )
    }
}
