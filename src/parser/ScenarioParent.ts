import { Taggable } from './Taggable'
import {
    Example, Scenario, ScenarioOutline, 
} from './scenario'

export abstract class ScenarioParent extends Taggable {

    public readonly name: string

    public readonly scenarii : Scenario[] = []

    protected constructor (name : string) {
        super()
        this.name = name
    }

    public getScenarioByName (name : string) : Scenario | ScenarioOutline | undefined {
        return this.scenarii.find((s : Scenario) => {
            return s.description === name
        })
    }

    public getScenarioExample (name : string) : Example | null {
        const scenario = this.getScenarioByName(name)

        if (scenario instanceof ScenarioOutline) {
            return scenario.examples
        }

        return null
    }

    public getFirstNotCalledScenario (tags : string[]) : Scenario | ScenarioOutline | undefined {
        return this.scenarii.find((scenario : Scenario) => {
            return scenario.isCalled === false && scenario.matchTags(tags) === false
        })
    }

    public haveAlreadyCalledScenario () : boolean {
        return this.scenarii
            .filter((scenario : Scenario) => scenario.isCalled === true)
            .length > 0
    }

}
