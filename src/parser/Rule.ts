import { ScenarioParent } from './ScenarioParent'

export class Rule extends ScenarioParent {
    public isCalled: boolean = false

    // biome-ignore lint/complexity/noUselessConstructor: <explanation>
    public constructor(name: string) {
        super(name)
    }
}
