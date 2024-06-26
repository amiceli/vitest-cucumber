import { StepAbleStepsNotCalledError, StepAbleUnknowStepError } from "../errors/errors"
import { Taggable } from "./Taggable"
import { Step, StepTypes } from "./step"

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
    
    public checkIfStepWasCalled () {
        const step = this.getNoCalledStep()

        if (step) {
            throw new StepAbleStepsNotCalledError(
                this, step,
            )
        }
    }

    public checkIfStepExists (stepType: string, stepDetails: string) {
        const foundStep = this.findStepByTypeAndDetails(
            stepType, stepDetails,
        )

        if (!foundStep) {
            throw new StepAbleUnknowStepError(
                this,
                new Step(stepType as StepTypes, stepDetails),
            )
        }

        return foundStep
    }

}