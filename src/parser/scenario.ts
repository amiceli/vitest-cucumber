import { Taggable } from './Taggable'
import { Step } from './step'

export class Scenario extends Taggable {

    public isCalled : boolean = false

    public steps: Step[] = []

    public description : string

    public constructor (description : string) {
        super()
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
}[]

export class ScenarioOutline extends Scenario {

    public examples : Example = []

    public missingExamplesKeyword : boolean = false

}