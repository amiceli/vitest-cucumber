import { ScenarioParent } from './ScenarioParent'
import { Rule } from './Rule'

export class Feature extends ScenarioParent {

    public readonly rules: Rule[] = []

    public constructor (name: string) {
        super(name)
    }

    public getRuleByName (name: string): Rule | undefined {
        return this.rules.find((rule) => rule.name === name)
    }

    public getFirstRuleNotCalled (tags : string[]): Rule | undefined {
        return this.rules.find((rule) => rule.isCalled === false && rule.matchTags(tags) === false)
    }

    public haveAlreadyCalledRule (): boolean {
        return this.rules.some((rule) => rule.isCalled === true)
    }

}
