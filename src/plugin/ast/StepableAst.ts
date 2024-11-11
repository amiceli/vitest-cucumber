import { type ArrowFunction, SyntaxKind } from 'ts-morph'
import type { ScenarioParent } from '../../parser/models'
import type { StepAble } from '../../parser/models/Stepable'
import { type AstOptions, BaseAst } from './BaseAst'

export type StepableAstOptions = AstOptions & {
    stepableParent: ScenarioParent
    stepableParentFunction: ArrowFunction
    forRule?: boolean
}

export abstract class StepableAst extends BaseAst {
    protected stepableParent: ScenarioParent

    protected stepableParentFunction: ArrowFunction

    protected readonly forRule: boolean

    protected constructor(options: StepableAstOptions) {
        super(options)

        this.stepableParent = options.stepableParent
        this.stepableParentFunction = options.stepableParentFunction
        this.forRule = options.forRule === true
    }

    public updateStepableArguments(
        stepable: StepAble,
        stepableArrowFunction: ArrowFunction,
    ) {
        const stepTypes = stepable.steps.map((step) => step.type)
        const stepTypesArg = `{ ${stepTypes.join(',')} }`

        const currentArg = stepableArrowFunction.getFirstDescendantByKind(
            SyntaxKind.ObjectBindingPattern,
        )

        if (currentArg) {
            currentArg.replaceWithText(stepTypesArg)
        }
    }
}
