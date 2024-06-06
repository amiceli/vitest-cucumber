import { StepAble } from './Stepable'

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

}