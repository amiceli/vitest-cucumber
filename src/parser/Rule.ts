import { ScenarioParent } from './ScenarioParent'

export class Rule extends ScenarioParent {
    public isCalled: boolean

    public constructor(name: string, title: string = 'Rule') {
        super(name, title)
        this.isCalled = false
    }
}
