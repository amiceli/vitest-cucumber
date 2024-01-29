import { ScenarioParent } from './ScenarioParent'
import { Rule } from './Rule'

export class Feature extends ScenarioParent {

    public readonly name: string

    public readonly rules: Rule[] = []

    public constructor (name: string) {
        super()
        this.name = name
    }

    public getRuleByName (name: string): Rule | undefined {
        return this.rules.find((rule) => rule.name === name)
    }

    public getFirstRuleNotCalled (): Rule | undefined {
        return this.rules.find((rule) => !rule.isCalled)
    }

    public haveAlreadyCalledRule (): boolean {
        return this.rules.some((rule) => rule.isCalled === true)
    }

}
