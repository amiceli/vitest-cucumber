import {
    ScenarioNotCalledError, FeatureUknowScenarioError, HookCalledAfterScenarioError, IsScenarioOutlineError, NotScenarioOutlineError, 
} from "../../errors/errors"
import { ScenarioParent } from "../../parser/ScenarioParent"
import { Scenario, ScenarioOutline } from "../../parser/scenario"

export abstract class ScenarioParentStatsDetector<U extends ScenarioParent> {

    public readonly scenarioParent : U

    protected constructor (scenarioParent: U) {
        this.scenarioParent = scenarioParent
    }

    public checkNotCalledScenario () {
        const noCalledScenario = this.scenarioParent.getFirstNotCalledScenario()

        if (noCalledScenario) {
            throw new ScenarioNotCalledError(noCalledScenario)
        }
    }

    public checkIfScenarioExists<T = Scenario> (scenarioDescription: string) : T {
        const foundScenario = this.scenarioParent.getScenarioByName(scenarioDescription)

        if (!foundScenario) {
            throw new FeatureUknowScenarioError(
                this.scenarioParent,
                new Scenario(scenarioDescription),
            )
        }

        return foundScenario as T
    }

    public alreadyCalledScenarioAtStart (hook: string) { // A tester
        if (this.scenarioParent.haveAlreadyCalledScenario()) {
            throw new HookCalledAfterScenarioError(
                this.scenarioParent,
                hook,
            )
        }
    }

    public scenarioShouldNotBeOutline (scenario: Scenario) {
        if (scenario instanceof ScenarioOutline) {
            throw new IsScenarioOutlineError(scenario)
        }
    }

    public scenarioShouldBeOutline (scenario: Scenario | ScenarioOutline) {
        if (!(scenario instanceof ScenarioOutline)) {
            throw new NotScenarioOutlineError(scenario)
        }
    }

}