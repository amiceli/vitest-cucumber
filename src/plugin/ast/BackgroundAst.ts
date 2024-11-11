import { type ArrowFunction, type CallExpression, SyntaxKind } from 'ts-morph'
import { generateBackground } from '../../../scripts/generateFile'
import { StepAst } from './StepAst'
import { StepableAst, type StepableAstOptions } from './StepableAst'

export class BackgroundAst extends StepableAst {
    private constructor(options: StepableAstOptions) {
        super(options)
    }

    public static fromOptions(options: StepableAstOptions): BackgroundAst {
        return new BackgroundAst(options)
    }

    public handleBackground() {
        const backgroundCallExpression = this.getBackgroundCallExpression()

        if (
            backgroundCallExpression === undefined &&
            this.stepableParent.background !== null
        ) {
            this.stepableParentFunction.insertStatements(
                0,
                generateBackground(
                    this.stepableParent.background,
                    this.forRule,
                ),
            )
        }

        if (
            backgroundCallExpression !== undefined &&
            this.stepableParent.background === null
        ) {
            if (this.shouldComment) {
                this.commentExpression(
                    this.stepableParentFunction,
                    backgroundCallExpression,
                )
            } else {
                this.removeChildFromParent(
                    this.stepableParentFunction,
                    backgroundCallExpression,
                )
            }
        }

        if (
            backgroundCallExpression !== undefined &&
            this.stepableParent.background !== null
        ) {
            const arrowFunction = this.getBackgroundArrowFunction()
            if (arrowFunction) {
                StepAst.fromOptions({
                    ...this.options,
                    stepParent: this.stepableParent.background,
                    stepParentFunction: arrowFunction,
                }).handleSteps()
                this.updateStepableArguments(
                    this.stepableParent.background,
                    arrowFunction,
                )
            }
        }
    }

    private getBackgroundArrowFunction(): ArrowFunction | undefined {
        return this.getBackgroundCallExpression()
            ?.getArguments()
            .find((arg) => arg.isKind(SyntaxKind.ArrowFunction))
    }

    private getBackgroundCallExpression(): CallExpression | undefined {
        const regex = this.forRule ? /\bRuleBackground\(/ : /\bBackground\(/

        return this.stepableParentFunction
            .getDescendantsOfKind(SyntaxKind.CallExpression)
            .find((call) => {
                return regex.test(call.getText())
            })
    }
}
