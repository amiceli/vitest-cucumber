import { Taggable } from "./Taggable"
import { Step } from "./step"

export abstract class StepAble extends Taggable {

    public abstract getTitle (): string

    public isCalled: boolean = false

    public steps: Step[] = []

    public findStepByTypeAndDetails (type : string, details : string) : Step | undefined {
        return this.steps.find((step : Step) => {
            return step.type === type && step.details === details
        })
    }

    public hasUnCalledSteps () : boolean {
        return this.getNoCalledStep() !== undefined
    }

    public getNoCalledStep () : Step | undefined {
        return this.steps.find((s) => s.isCalled === false)
    }

    public addStep (step : Step) {
        this.steps.push(step)
    }

}