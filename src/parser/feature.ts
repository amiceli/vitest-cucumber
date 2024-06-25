import { ScenarioParent } from './ScenarioParent'
import { Rule } from './Rule'
import { RuleNotCalledError } from '../errors/errors'

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

    public checkUncalledRule (tags : string[]) {
        const uncalled = this.getFirstRuleNotCalled(tags)

        if (uncalled) {
            throw new RuleNotCalledError(uncalled)
        }

        return this
    }

}
