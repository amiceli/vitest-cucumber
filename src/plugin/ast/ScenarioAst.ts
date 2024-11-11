import { type ArrowFunction, SyntaxKind } from 'ts-morph'
import { generateScenarii } from '../../../scripts/generateFile'
import type { Scenario } from '../../parser/models'
import type { VitestCallExpression } from './BaseAst'
import { StepAst } from './StepAst'
import { StepableAst, type StepableAstOptions } from './StepableAst'

export class ScenarioAst extends StepableAst {
    private constructor(options: StepableAstOptions) {
        super(options)
    }

    public static fromOptions(options: StepableAstOptions): ScenarioAst {
        return new ScenarioAst(options)
    }

    public handleScenarii() {
        const scenariiArrow = this.getScenariiArrowFunction()

        const scenariiToAdd = this.getMissingScenarri(scenariiArrow)
        const scenariiToRemove = this.getScenariiToRemove(scenariiArrow)

        for (const s of scenariiToRemove) {
            if (this.shouldComment) {
                this.commentExpression(
                    this.stepableParentFunction,
                    s.callExpression,
                )
            } else {
                this.removeChildFromParent(
                    this.stepableParentFunction,
                    s.callExpression,
                )
            }
        }

        this.stepableParentFunction.addStatements(
            generateScenarii(scenariiToAdd || [], this.forRule),
        )

        for (const scenario of this.stepableParent.scenarii) {
            const scenarioArrowFunction =
                this.getScenarioArrowFunction(scenario)

            if (scenarioArrowFunction) {
                StepAst.fromOptions({
                    ...this.options,
                    stepParent: scenario,
                    stepParentFunction: scenarioArrowFunction,
                }).handleSteps()
                this.updateStepableArguments(scenario, scenarioArrowFunction)
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
                this.stepableParent.scenarii
                    .map((s) => s.description)
                    .includes(scenario.name) === false
            )
        })
    }

    private getMissingScenarri(
        parentScenarii: VitestCallExpression[],
    ): Scenario[] {
        return this.stepableParent.scenarii.filter((scenario) => {
            return (
                parentScenarii
                    .map((s) => s.name)
                    .includes(scenario.description) === false
            )
        })
    }

    private getScenariiArrowFunction(): VitestCallExpression[] {
        return this.callExpressionMatchRegExp(
            this.stepableParentFunction,
            this.forRule
                ? /\b(RuleScenario|RuleScenarioOutline)\(/
                : /\b(Scenario|ScenarioOutline)\(/,
        )
    }
}
