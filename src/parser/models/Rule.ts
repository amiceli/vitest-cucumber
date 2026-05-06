import {
    type Background,
    DefineBackground,
    DefineScenario,
    type Scenario,
} from '.'
import { ScenarioParent } from './ScenarioParent'
import {
    DefineScenarioOutline,
    type Example,
    type ScenarioOutline,
} from './scenario'

export class Rule extends ScenarioParent {
    public isCalled: boolean

    public constructor(name: string, title: string = 'Rule') {
        super(name, title)
        this.isCalled = false
    }
}

export class DefineRule extends Rule {
    private readonly definedOutlines: Map<string, DefineScenarioOutline> =
        new Map()

    public getBackground(): Background {
        return new DefineBackground()
    }

    public getScenario(description: string): Scenario {
        return new DefineScenario(description)
    }

    public registerScenarioOutline(
        description: string,
        examples: Example,
    ): DefineScenarioOutline {
        const outline = new DefineScenarioOutline(description)
        outline.examples = examples
        this.definedOutlines.set(description, outline)

        return outline
    }

    public getScenarioOutline(description: string): ScenarioOutline {
        const existing = this.definedOutlines.get(description)

        if (existing) {
            return existing
        }

        const outline = new DefineScenarioOutline(description)
        this.definedOutlines.set(description, outline)

        return outline
    }
}
