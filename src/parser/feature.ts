import { ScenarioParent } from './ScenarioParent'
import { Rule } from './Rule'

export class Feature extends ScenarioParent {

    private readonly _rules: Rule[] = []

    public constructor (name: string) {
        super(name)
    }

    public getRuleByName (name: string): Rule | undefined {
        return this._rules.find((rule) => rule.name === name)
    }

    public getFirstRuleNotCalled (tags : string[]): Rule | undefined {
        return this._rules.find((rule) => rule.isCalled === false && rule.matchTags(tags) === false)
    }

    public haveAlreadyCalledRule (): boolean {
        return this._rules.some((rule) => rule.isCalled === true)
    }

    public addRule (rule: Rule) {
        rule.setParent(this)
        this._rules.push(rule)
    }

    public get rules () : Readonly<Rule[]> {
        return this._rules
    }

}
