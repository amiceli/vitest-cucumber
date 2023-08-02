import { Step, stepNames } from './step'

export class Scenario {

    public isCalled : boolean = false

    public steps: Step[] = []

    public readonly name : string

    public constructor (name : string) {
        this.name = name
    }

    public getStepByNameAndTitle (name : string, title : string) : Step | undefined {
        return this.steps.find((s : Step) => {
            const titleIsOk = s.title === title
            const nameIsOk = s.name === name

            return nameIsOk && titleIsOk
        })
    }

    public hasUnCalledSteps () : boolean {
        return this.getNoCalledSteps().length > 0
    }

    public getNoCalledSteps () : Step[] {
        return this.steps.filter((s) => s.isCalled === false)
    }

}