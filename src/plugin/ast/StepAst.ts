import { type ArrowFunction, type CallExpression, SyntaxKind } from 'ts-morph'
import { generateStep } from '../../../scripts/generateFile'
import type {
    Background,
    Scenario,
    ScenarioOutline,
    Step,
} from '../../parser/models'
import { type AstOptions, BaseAst } from './BaseAst'
import { isString } from './ast-utils'

type StepAstOptions = AstOptions & {
    stepParent: Scenario | ScenarioOutline | Background
    stepParentFunction: ArrowFunction
}

type StepExpression = {
    name: string
    callExpression: CallExpression
}

export class StepAst extends BaseAst {
    private stepParent: Scenario | ScenarioOutline | Background

    private stepParentFunction: ArrowFunction

    private constructor(options: StepAstOptions) {
        super(options)

        this.stepParent = options.stepParent
        this.stepParentFunction = options.stepParentFunction
    }

    public static fromOptions(options: StepAstOptions): StepAst {
        return new StepAst(options)
    }

    public handleSteps() {
        const parentScenarii = this.getParentArrowSteps()

        const stepsToAdd = this.getMissingScenarri(parentScenarii)
        const stepsToRemove = this.getScenariiToRemove(parentScenarii)

        for (const s of stepsToRemove) {
            this.stepParentFunction.removeStatement(
                s.callExpression.getChildIndex(),
            )
        }
        for (const step of stepsToAdd) {
            this.stepParentFunction.addStatements(generateStep(step))
        }
    }

    private getScenariiToRemove(
        parentSteps: StepExpression[],
    ): StepExpression[] {
        return parentSteps.filter((step) => {
            return (
                step.name &&
                this.stepParent.steps
                    .map((s) => s.title)
                    .includes(step.name) === false
            )
        })
    }

    private getMissingScenarri(parentSteps: StepExpression[]): Step[] {
        return this.stepParent.steps.filter((step) => {
            return parentSteps.map((s) => s.name).includes(step.type) === false
        })
    }

    private isStepLine(line: string): boolean {
        const regex = /\b(Given|Then|When|And|But)\b/

        return regex.test(line)
    }

    private getParentArrowSteps(): StepExpression[] {
        return this.stepParentFunction
            .getDescendantsOfKind(SyntaxKind.CallExpression)
            .filter((call) => this.isStepLine(call.getText()))
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
            .filter((step): step is StepExpression => step?.name !== undefined)
    }
}
