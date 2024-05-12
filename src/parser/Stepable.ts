import { NotCalledStepError, UnknowStepError } from "../errors/errors"
import { ScenarioParent } from "./ScenarioParent"
import { Taggable } from "./Taggable"
import { Step, StepTypes } from "./step"

export abstract class StepAble extends Taggable {

    public abstract toString (): string

    public isCalled : boolean = false

    private readonly _steps: Step[] = []

    private _parent: ScenarioParent | undefined
    
    public setParent (parent: ScenarioParent) {
        this._parent = parent
    }

    public addStep (step: Step) {
        step.setParent(this)

        this._steps.push(step)
    }

    public findStep (type : StepTypes, details : string) : Step {
        const foundStep = this._steps.find(
            (step: Step) => (step.type === type && step.details === details),
        )

        if (!foundStep) {
            throw new UnknowStepError(
                this,
                new Step(type, details),
            )
        }

        return foundStep
    }

    public checkMissingSteps (steps: Step[]) : void {
        const missingStep = this.steps.filter((s) => !steps.includes(s))

        if (missingStep.length > 0) {
            throw new NotCalledStepError(
                this, missingStep,
            )
        }
    }

    public get steps (): Readonly<Step[]> {
        return this._steps
    }

    public get parent () : ScenarioParent | undefined {
        return this._parent
    }

}