export enum StepTypes {
    THEN = `Then`,
    AND = `And`,
    WHEN = `When`,
    GIVEN = `Given`,
    BUT = `But`,
}

export class Step {
    public readonly type: StepTypes

    public readonly details: string

    public docStrings: string | null = null

    public isCalled: boolean

    private readonly title: string

    public constructor(type: StepTypes, details: string, title?: string) {
        this.details = details
        this.type = type
        this.isCalled = false
        this.title = title || `${type}`
    }

    public getTitle(): string {
        return `${this.title} ${this.details}`
    }

    public setDocStrings(docStrings: string) {
        this.docStrings = docStrings
    }
}
