import { type ArrowFunction, type CallExpression, SyntaxKind } from 'ts-morph'
import { generateStep } from '../../../scripts/generateFile'
import { ExpressionStep } from '../../parser/expression/ExpressionStep'
import type {
    Background,
    Scenario,
    ScenarioOutline,
    Step,
} from '../../parser/models'
import type { StepAble } from '../../parser/models/Stepable'
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
    private stepableParent: StepAble

    private stepParentFunction: ArrowFunction

    private constructor(options: StepAstOptions) {
        super(options)

        this.stepableParent = options.stepParent
        this.stepParentFunction = options.stepParentFunction
    }

    public static fromOptions(options: StepAstOptions): StepAst {
        return new StepAst(options)
    }

    public handleSteps() {
        const stepExpressions = this.getStepExpressions()

        const stepsToAdd = this.getStepsToAdd(stepExpressions)
        const stepsToRemove = this.getStepsToRemove(stepExpressions)

        if (this.stepableParent.getTitle().includes('add step')) {
            console.debug({
                stepExpressions: stepExpressions.map((s) =>
                    s.callExpression.getText(),
                ),
                stepsToAdd,
                stepsToRemove,
            })
        }

        for (const s of stepsToRemove) {
            if (this.shouldComment) {
                this.commentExpression(
                    this.stepParentFunction,
                    s.callExpression,
                )
            } else {
                this.removeChildFromParent(
                    this.stepParentFunction,
                    s.callExpression,
                )
            }
        }
        for (const step of stepsToAdd) {
            this.stepParentFunction.addStatements(generateStep(step))
        }
    }

    private getStepsToRemove(parentSteps: StepExpression[]): StepExpression[] {
        return parentSteps.filter((stepExpression) => {
            const stepExistsInScenario = this.stepableParent.steps.some(
                (step) => {
                    return this.stepMatchCallExpression(stepExpression, step)
                },
            )

            return stepExistsInScenario === false
        })
    }

    private getStepsToAdd(parentSteps: StepExpression[]): Step[] {
        return this.stepableParent.steps.filter((step) => {
            const stepIsInScenarioSpec = parentSteps.some((stepExpression) => {
                return this.stepMatchCallExpression(stepExpression, step)
            })

            return !stepIsInScenarioSpec
        })
    }

    private stepMatchCallExpression(
        stepExpression: StepExpression,
        step: Step,
    ): boolean {
        const match = ExpressionStep.matchStep(step, stepExpression.name)

        return match.length > 0 || stepExpression.name === step.details
    }

    private isStepLine(line: string): boolean {
        const regex = /\b(Given|Then|When|And|But)\b/

        return regex.test(line)
    }

    private getStepExpressions(): StepExpression[] {
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
