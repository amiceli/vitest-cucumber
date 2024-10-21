import { FeatureUknowRuleError, RuleNotCalledError } from '../../errors/errors'
import type { RequiredDescribeFeatureOptions } from '../../vitest/describe-feature'
import { Rule } from './Rule'
import { ScenarioParent } from './ScenarioParent'

export class Feature extends ScenarioParent {
    public readonly rules: Rule[]

    public constructor(name: string, title: string = 'Feature') {
        super(name, title)
        this.rules = []
    }

    public getRuleByName(name: string): Rule | undefined {
        return this.rules.find((rule) => rule.name === name)
    }

    public getFirstRuleNotCalled(
        options: RequiredDescribeFeatureOptions,
    ): Rule | undefined {
        return this.rules.find(
            (rule) =>
                rule.isCalled === false &&
                (options.includeTags.length <= 0 ||
                    rule.matchTags(options.includeTags) === true) &&
                rule.matchTags(options.excludeTags) === false,
        )
    }

    public haveAlreadyCalledRule(): boolean {
        return this.rules.some((rule) => rule.isCalled === true)
    }

    public checkUncalledRule(options: RequiredDescribeFeatureOptions) {
        const uncalled = this.getFirstRuleNotCalled(options)

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

    public mustHaveScenarioOrRules() {
        if (this.rules.length > 0) {
            for (const rule of this.rules) {
                rule.mustHaveScenario()
            }
        } else {
            this.mustHaveScenario()
        }
    }
}
