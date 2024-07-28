import { StepAble } from './Stepable'
import { Step } from './step'

export class Scenario extends StepAble {

    public description : string

    public constructor (description : string) {
        super()
        this.description = description
    }

    public getTitle (): string {
        return `Scenario: ${this.description}`
    }

}

export type Example = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
}[]

export class ScenarioOutline extends Scenario {

    public examples : Example = []

    public missingExamplesKeyword: boolean = false
    
    public getTitle (): string {
        return `Scenario Outline: ${this.description}`
    }

    public getStepTitle (step : Step, example : Example[0]) : string {
        let stepTitle = step.getTitle()

        const exampleKeys = Object.keys(example)

        exampleKeys.forEach((key) => {
            stepTitle = stepTitle.replace(
                `<${key}>`, example[key],
            )
        })

        return stepTitle
    }

}