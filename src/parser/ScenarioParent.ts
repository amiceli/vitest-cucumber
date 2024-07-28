import {
    BackgroundNotCalledError, BackgroundNotExistsError, FeatureUknowScenarioError, IsScenarioOutlineError, NotScenarioOutlineError, ScenarioNotCalledError, 
} from '../errors/errors'
import { Background } from './Background'
import { Taggable } from './Taggable'
import {
    Example, Scenario, ScenarioOutline, 
} from './scenario'

export abstract class ScenarioParent extends Taggable {

    public readonly name: string

    public readonly scenarii : Scenario[] = []

    public background : Background | null = null

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

    public getTitle (): string {
        return `${this.constructor.name}: ${this.name}`
    }

    public checkUncalledScenario (tags : string[]) {
        const uncalled = this.getFirstNotCalledScenario(tags)

        if (uncalled) {
            throw new ScenarioNotCalledError(uncalled)
        }

        return this
    }

    public checkUncalledBackground (tags : string[]) {
        if (this.background) {
            if (!this.background.isCalled && !this.background.matchTags(tags)) {
                throw new BackgroundNotCalledError(this.background)
            }
        }

        return this
    }

    public getBackground () : Background {
        if (this.background) {
            return this.background
        }

        throw new BackgroundNotExistsError(this)
    }

    private checkIfScenarioExists (scenarioDescription: string) : Scenario {
        const foundScenario = this.getScenarioByName(scenarioDescription)

        if (!foundScenario) {
            throw new FeatureUknowScenarioError(
                this,
                new Scenario(scenarioDescription),
            )
        }

        return foundScenario
    }

    private scenarioShouldNotBeOutline (scenario: Scenario) {
        if (scenario instanceof ScenarioOutline) {
            throw new IsScenarioOutlineError(scenario)
        }
    }

    private scenarioShouldBeOutline (scenario: Scenario) {
        if (!(scenario instanceof ScenarioOutline)) {
            throw new NotScenarioOutlineError(scenario)
        }
    }

    public getScenario (description : string) : Scenario {
        const scenario = this.checkIfScenarioExists(description)

        this.scenarioShouldNotBeOutline(scenario)

        return scenario
    }

    public getScenarioOutline (description : string) : ScenarioOutline {
        const scenario = this.checkIfScenarioExists(description) as ScenarioOutline

        this.scenarioShouldBeOutline(scenario)

        return scenario
    }

}
