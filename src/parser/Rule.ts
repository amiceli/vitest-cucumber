import { ScenarioParent } from "./ScenarioParent"

export class Rule extends ScenarioParent {

    public isCalled : boolean = false

    public constructor (name: string) {
        super(name)
    }

}