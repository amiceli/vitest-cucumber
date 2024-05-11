import { ScenarioParent } from "./ScenarioParent"
import { Feature } from "./feature"

export class Rule extends ScenarioParent {

    public isCalled : boolean = false
    
    private _parent : Feature | undefined

    public constructor (name: string) {
        super(name)
    }

    public setParent (parent: Feature) {
        this._parent = parent
    }

    public get parent (): Feature | undefined {
        return this._parent
    }

    public toString (): string {
        return `Rule: ${this.name}`
    }

}