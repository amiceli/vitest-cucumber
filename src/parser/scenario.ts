import { Step } from './step'

export class Scenario {

    public isCalled : boolean = false

    public steps: Step[] = []

    public readonly description : string

    public constructor (description : string) {
        this.description = description
    }

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

}

export type Example = {
    [key: string]: any[]
}

export class ScenarioOutline extends Scenario {

    public examples : Example = {}

}