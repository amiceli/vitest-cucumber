import {
    RuleNotCalledError, FeatureUknowRuleError, HookCalledAfterRuleError, 
} from "../../errors/errors"
import { Rule } from "../../parser/Rule"
import { Feature } from "../../parser/feature"
import { ScenarioParentStatsDetector } from "./ScenarioParentStatsDetector"

export class FeatureStateDetector extends ScenarioParentStatsDetector<Feature> {

    private readonly feature: Feature

    private constructor (feature: Feature, excludeTags : string[]) {
        super(feature, excludeTags)
        this.feature = feature
    }

    public static forFeature (feature: Feature, excludeTags : string[]) {
        return new FeatureStateDetector(feature, excludeTags)
    }

    public checkNotCalledRule () {
        const notCalledRule = this.scenarioParent.getFirstRuleNotCalled(this.excludeTags)

        if (notCalledRule) {
            throw new RuleNotCalledError(notCalledRule)
        }
    }

    public checkIfRuleExists (ruleName : string) : Rule {
        const foundRule = this.scenarioParent.getRuleByName(ruleName)

        if (!foundRule) {
            throw new FeatureUknowRuleError(
                this.scenarioParent,
                new Rule(ruleName),
            )
        }

        return foundRule
    }

    public alreadyCalledRuleAtStart (hook: string) { // A tester
        if (this.scenarioParent.haveAlreadyCalledRule()) {
            throw new HookCalledAfterRuleError(
                this.scenarioParent,
                hook,
            )
        }
    }

}