import {
    type Background,
    DefineBackground,
    DefineScenario,
    type Scenario,
} from '.'
import { ScenarioParent } from './ScenarioParent'

export class Rule extends ScenarioParent {
    public isCalled: boolean

    public constructor(name: string, title: string = 'Rule') {
        super(name, title)
        this.isCalled = false
    }
}

export class DefineRule extends Rule {
    public getBackground(): Background {
        return new DefineBackground()
    }

    public getScenario(description: string): Scenario {
        return new DefineScenario(description)
    }
}
