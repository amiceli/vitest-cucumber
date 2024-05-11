import { ScenarioParent } from "./ScenarioParent"
import { Taggable } from "./Taggable"
import { Step } from "./step"

export abstract class StepAble extends Taggable {

    public isCalled : boolean = false

    private readonly _steps: Step[] = []

    private _parent : ScenarioParent | undefined

    public findStepByTypeAndDetails (type : string, details : string) : Step | undefined {
        return this._steps.find((step : Step) => {
            return step.type === type && step.details === details
        })
    }

    public hasUnCalledSteps () : boolean {
        return this.getNoCalledSteps().length > 0
    }

    public getNoCalledSteps () : Step[] {
        return this._steps.filter((s) => s.isCalled === false)
    }

    public addStep (step: Step) {
        step.setParent(this)

        this._steps.push(step)
    }

    public get steps (): Readonly<Step[]> {
        return this._steps
    }

    public get parent () : ScenarioParent | undefined {
        return this._parent
    }

    public setParent (parent: ScenarioParent) {
        this._parent = parent
    }

}