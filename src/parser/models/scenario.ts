import { StepAble } from './Stepable'
import { Step, type StepTypes } from './step'

export class Scenario extends StepAble {
    public description: string

    public constructor(description: string, title: string = 'Scenario') {
        super(title)
        this.description = description
    }

    public getTitle(): string {
        return `${this.title}: ${this.description}`
    }
}

export type Example = {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [key: string]: any
}[]

export class ScenarioOutline extends Scenario {
    public examples: Example = []

    public missingExamplesKeyword: boolean = false

    public constructor(
        description: string,
        title: string = 'Scenario Outline',
    ) {
        super(description, title)
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

export class DefineScenario extends Scenario {
    public checkIfStepExists(stepType: string, stepDetails: string): Step {
        const step = new Step(stepType as StepTypes, stepDetails)
        this.addStep(step)

        return super.checkIfStepExists(stepType, stepDetails)
    }
}
