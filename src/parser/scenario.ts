import { Step } from './step'

export class Scenario {

    public isCalled : boolean = false

    public steps: Step[] = []

    public readonly name : string

    public constructor (name : string) {
        this.name = name
    }

}