import { ScenarioParent } from "./ScenarioParent"

export class Rule extends ScenarioParent {

    public name: string

    public isCalled : boolean = false

    public constructor (name: string) {
        super()
        this.name = name
    }

}