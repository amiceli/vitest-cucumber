import { FeatureUknowRuleError, RuleNotCalledError } from '../errors/errors'
import { Rule } from './Rule'
import { ScenarioParent } from './ScenarioParent'

export class Feature extends ScenarioParent {
    public readonly rules: Rule[] = []

    // biome-ignore lint/complexity/noUselessConstructor: <explanation>
    public constructor(name: string) {
        super(name)
    }

    public getRuleByName(name: string): Rule | undefined {
        return this.rules.find((rule) => rule.name === name)
    }

    public getFirstRuleNotCalled(tags: string[]): Rule | undefined {
        return this.rules.find(
            (rule) => rule.isCalled === false && rule.matchTags(tags) === false,
        )
    }

    public haveAlreadyCalledRule(): boolean {
        return this.rules.some((rule) => rule.isCalled === true)
    }

    public checkUncalledRule(tags: string[]) {
        const uncalled = this.getFirstRuleNotCalled(tags)

        if (uncalled) {
            throw new RuleNotCalledError(uncalled)
        }

        return this
    }

    public checkIfRuleExists(ruleName: string): Rule {
        const foundRule = this.getRuleByName(ruleName)

        if (!foundRule) {
            throw new FeatureUknowRuleError(this, new Rule(ruleName))
        }

        return foundRule
    }
}
