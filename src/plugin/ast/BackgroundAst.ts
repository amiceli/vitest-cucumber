import { type ArrowFunction, type CallExpression, SyntaxKind } from 'ts-morph'
import { generateBackground } from '../../../scripts/generateFile'
import type { ScenarioParent } from '../../parser/models'
import { type AstOptions, BaseAst } from './BaseAst'
import { StepAst } from './StepAst'

type BackgroundAstOptions = AstOptions & {
    backgroundParent: ScenarioParent
    backgroundParentFunction: ArrowFunction
    forRule?: boolean
}

export class BackgroundAst extends BaseAst {
    private backgroundParent: ScenarioParent

    private backgroundParentFunction: ArrowFunction

    private readonly forRule: boolean

    private constructor(options: BackgroundAstOptions) {
        super(options)

        this.backgroundParent = options.backgroundParent
        this.backgroundParentFunction = options.backgroundParentFunction
        this.forRule = options.forRule === true
    }

    public static fromOptions(options: BackgroundAstOptions): BackgroundAst {
        return new BackgroundAst(options)
    }

    public handleBackground() {
        const backgroundCallExpression = this.getBackgroundArrowFunction()

        if (
            backgroundCallExpression === undefined &&
            this.backgroundParent.background !== null
        ) {
            this.backgroundParentFunction.insertStatements(
                0,
                generateBackground(
                    this.backgroundParent.background,
                    this.forRule,
                ),
            )
        }

        if (
            backgroundCallExpression !== undefined &&
            this.backgroundParent.background === null
        ) {
            backgroundCallExpression
                .getParentIfKind(SyntaxKind.ExpressionStatement)
                ?.remove()
        }

        if (
            backgroundCallExpression !== undefined &&
            this.backgroundParent.background !== null
        ) {
            const arrowFunction = this.zeubi()
            if (arrowFunction) {
                StepAst.fromOptions({
                    ...this.options,
                    stepParent: this.backgroundParent.background,
                    stepParentFunction: arrowFunction,
                }).handleSteps()
            }
        }
    }

    private zeubi(): ArrowFunction | undefined {
        return this.getBackgroundArrowFunction()
            ?.getArguments()
            .find((arg) => arg.isKind(SyntaxKind.ArrowFunction))
    }

    // private getScenariiToRemove(
    //     parentScenarii: VitestCallExpression[],
    // ): VitestCallExpression[] {
    //     return parentScenarii.filter((scenario) => {
    //         return (
    //             scenario.name &&
    //             this.backgroundParent.scenarii
    //                 .map((s) => s.description)
    //                 .includes(scenario.name) === false
    //         )
    //     })
    // }

    // private getMissingBackground(
    //     parentScenarii: CallExpression,
    // ): Scenario[] {
    //     return this.backgroundParent.scenarii.filter((scenario) => {
    //         return (
    //             parentScenarii
    //                 .map((s) => s.name)
    //                 .includes(scenario.description) === false
    //         )
    //     })
    // }

    private getBackgroundArrowFunction(): CallExpression | undefined {
        const regex = this.forRule ? /\bRuleBackground\(/ : /\bBackground\(/

        return this.backgroundParentFunction
            .getDescendantsOfKind(SyntaxKind.CallExpression)
            .find((call) => {
                return regex.test(call.getText())
            })
    }
}
