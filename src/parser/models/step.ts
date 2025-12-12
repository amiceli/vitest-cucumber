import { ExpressionStep } from '../expression/ExpressionStep'

export enum StepTypes {
    THEN = `Then`,
    AND = `And`,
    WHEN = `When`,
    GIVEN = `Given`,
    BUT = `But`,
}

export type StepDataTanle = {
    [key: string]: string
}[]

export class Step {
    public readonly type: StepTypes

    public readonly details: string

    public docStrings: string | null = null

    public isCalled: boolean

    public dataTables: StepDataTanle = []

    public readonly title: string

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

    public matchStep(step: Step): boolean {
        if (this.type !== step.type) {
            return false
        }

        // Exact match
        if (this.details === step.details) {
            return true
        }

        // Expression match: step contains pattern (e.g. {string}), this has actual value
        if (ExpressionStep.stepContainsRegex(step.details)) {
            try {
                ExpressionStep.matchStep(this, step.details)
                return true
            } catch {
                return false
            }
        }

        return false
    }
}
