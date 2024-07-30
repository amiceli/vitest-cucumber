
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

    public docStrings : string | null = null

    public isCalled : boolean

    public constructor (type : StepTypes, details : string) {
        this.details = details
        this.type = type
        this.isCalled = false
    }

    public getTitle (): string {
        return `${this.type} ${this.details}`
    }

    public setDocStrings (docStrings : string) {
        this.docStrings = docStrings
    }

}