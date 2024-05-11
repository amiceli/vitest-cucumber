import { Background } from './Background'
import { Taggable } from './Taggable'
import {
    Example, Scenario, ScenarioOutline, 
} from './scenario'

export abstract class ScenarioParent extends Taggable {

    public readonly name: string

    public readonly _scenarii : Scenario[] = []

    private _background : Background | undefined = undefined

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

    public get scenarii (): Readonly<Scenario[]> {
        return this._scenarii
    }

    public addScenario (scenario: Scenario) {
        scenario.setParent(this)

        this._scenarii.push(scenario)
    }

    public get background (): Background | undefined {
        return this._background
    }

    public setBackground (background: Background) {
        this._background = background
        this._background.setParent(this)
    }

}
