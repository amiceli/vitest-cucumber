import { Taggable } from "./Taggable"
import { Step } from "./step"

export abstract class StepAble extends Taggable {

    public isCalled : boolean = false

    public steps: Step[] = []

    public findStepByTypeAndDetails (type : string, details : string) : Step | undefined {
        return this.steps.find((step : Step) => {
            return step.type === type && step.details === details
        })
    }

    public hasUnCalledSteps () : boolean {
        return this.getNoCalledSteps().length > 0
    }

    public getNoCalledSteps () : Step[] {
        return this.steps.filter((s) => s.isCalled === false)
    }

    public addStep (step : Step) {
        this.steps.push(step)
    }

}