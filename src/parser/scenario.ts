import { StepAble } from './Stepable'
import type { Step } from './step'

export class Scenario extends StepAble {
    public description: string

    public constructor(description: string) {
        super()
        this.description = description
    }

    public getTitle(): string {
        return `Scenario: ${this.description}`
    }
}

export type Example = {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [key: string]: any
}[]

export class ScenarioOutline extends Scenario {
    public examples: Example = []

    public missingExamplesKeyword: boolean = false

    public getTitle(): string {
        return `Scenario Outline: ${this.description}`
    }

    public getStepTitle(step: Step, example: Example[0]): string {
        let stepTitle = step.getTitle()

        const exampleKeys = Object.keys(example)

        for (const key of exampleKeys) {
            stepTitle = stepTitle.replace(`<${key}>`, example[key])
        }

        return stepTitle
    }

    public getStepDocStrings(step: Step, example: Example[0]): string | null {
        if (step.docStrings) {
            let docStrings = `${step.docStrings}`

            for (const key in example) {
                docStrings = docStrings.replace(`<${key}>`, example[key])
            }

            return docStrings
        }

        return null
    }
}
