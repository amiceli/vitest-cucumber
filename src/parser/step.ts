import { StepAble } from "./Stepable"

export enum StepTypes {
    THEN = `Then`,
    AND = `And`,
    WHEN = `When`,
    GIVEN = `Given`,
    BUT = `But`,
}

export class Step {

    public readonly type : StepTypes
    
    public readonly details : string
    
    private _parent : StepAble | undefined = undefined

    public constructor (type : StepTypes, details : string) {
        this.details = details
        this.type = type
    }

    public setParent (parent: StepAble) {
        this._parent = parent
    }

    public toString () : string {
        return `${this.type} ${this.details}`
    }

    public get parent (): StepAble | undefined {
        return this._parent
    }

}