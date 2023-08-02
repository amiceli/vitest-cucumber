import { Scenario } from './scenario'

export class Feature {

    public readonly name : string

    public readonly scenarii : Scenario[] = []

    public constructor (name : string) {
        this.name = name
    }

    public getScenarioByName (name : string) : Scenario | undefined {
        return this.scenarii.find((s : Scenario) => {
            return s.name === name
        })
    }

    public getNotCalledFirstScenario () : Scenario | undefined {
        return this.scenarii.find((scenario : Scenario) => {
            return scenario.isCalled === false
        })
    }

}
