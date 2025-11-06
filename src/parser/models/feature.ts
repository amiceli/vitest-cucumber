import {
    FeatureUknowRuleError,
    ItemAlreadyExistsError,
    RuleNotCalledError,
} from '../../errors/errors'
import type { RequiredDescribeFeatureOptions } from '../../vitest/describe-feature'
import {
    type Background,
    DefineBackground,
    DefineScenario,
    type Scenario,
    type ScenarioOutline,
} from '.'
import { DefineRule, Rule } from './Rule'
import { ScenarioParent } from './ScenarioParent'

export class Feature extends ScenarioParent {
    private readonly _rules: Rule[]

    public readonly withoutGherkin: boolean

    public constructor(
        name: string,
        title: string = 'Feature',
        withoutGherkin: boolean = false,
    ) {
        super(name, title)

        this._rules = []
        this.withoutGherkin = withoutGherkin
    }

    public getRuleByName(name: string): Rule | undefined {
        return this._rules.find((rule) => rule.name === name)
    }

    public getFirstRuleNotCalled(
        options: RequiredDescribeFeatureOptions,
    ): Rule | undefined {
        return this._rules.find(
            (rule) =>
                rule.isCalled === false &&
                (options.includeTags.length <= 0 ||
                    rule.matchTags(options.includeTags) === true) &&
                rule.matchTags(options.excludeTags) === false,
        )
    }

    public haveAlreadyCalledRule(): boolean {
        return this._rules.some((rule) => rule.isCalled === true)
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
        if (this._rules.length > 0) {
            for (const rule of this._rules) {
                rule.mustHaveScenario()
            }
        } else {
            this.mustHaveScenario()
        }
    }

    public addRule(newRule: Rule) {
        const duplicatedRule = this._rules.find((rule) => {
            return rule.getTitle() === newRule.getTitle()
        })

        if (duplicatedRule) {
            throw new ItemAlreadyExistsError(this, newRule)
        }

        this._rules.push(newRule)
    }

    public get rules(): Readonly<Rule[]> {
        return this._rules
    }
}

export class DefineFeature extends Feature {
    public getBackground(): Background {
        return new DefineBackground()
    }

    public getScenarioOutline(_: string): ScenarioOutline {
        throw "ScenarioOutline isn't avalaible on defineFeature"
    }

    public getScenario(description: string): Scenario {
        return new DefineScenario(description)
    }

    public checkIfRuleExists(ruleName: string): Rule {
        return new DefineRule(ruleName)
    }
}
