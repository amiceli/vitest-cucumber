import { Feature } from "./feature"
import {
    Example, Scenario, ScenarioOutline, 
} from "./scenario"
import { Step, StepTypes } from "./step"

export class GherkinParser {

    public readonly features: Feature[] = []

    private currentFeatureIndex: number = -1

    private currentScenarioIndex: number = -1

    private lastScenarioOutline: ScenarioOutline | null = null

    private currentExample : Example | null = null

    public addLine (line: string) {
        if (line.includes(`Feature:`)) {
            this.currentFeatureIndex++
            this.currentScenarioIndex = -1

            const featureName = this.getTextAfterKeyword(line, `Feature`)
            const feature = new Feature(featureName)

            this.features.push(feature)
        }  else if (line.includes(`Scenario Outline:`)) {
            this.currentScenarioIndex++

            const scenarioName = this.getTextAfterKeyword(line, `Scenario Outline`)
            const scneario = new ScenarioOutline(scenarioName)

            this.currentFeature.scenarii.push(scneario)

            this.lastScenarioOutline = scneario
        } else if (line.includes(`Examples:`)) {
            this.currentExample = {}
        } else if (line.trim().startsWith(`|`)) {
            if (this.currentExample === null) {
                this.currentExample = {}
            }

            const exampleVariables = line
                .trim().split(`|`)
                .filter((n) => n.length > 0)
                .map((n) => n.trim())
            
            if (Object.keys(this.currentExample).length > 0) {
                exampleVariables.forEach((varoanle, index) => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.currentExample![
                        Object.keys(this.currentExample!)[index]
                    ].push(varoanle)
                })
            } else {
                exampleVariables.forEach((varoanle) => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.currentExample![varoanle] = []
                })
            }

        } else if (line.includes(`Scenario:`)) {
            this.currentScenarioIndex++

            const scenarioName = this.getTextAfterKeyword(line, `Scenario`)
            const scneario = new Scenario(scenarioName)

            this.currentFeature.scenarii.push(scneario)
        } else if (this.isStep(line)) {
            const stepType = this.findStepType(line)
            const stepDetails = this.findStepDetails(line, stepType)
            const newStep = new Step(stepType, stepDetails)

            this.currentScenario.steps.push(newStep)
        } else if (this.currentExample) {
            if (this.lastScenarioOutline) {
                this.lastScenarioOutline.examples = JSON.parse(JSON.stringify(this.currentExample))
            }

            this.currentExample = null
        }
    }

    public finish (): Feature[] {
        if (this.lastScenarioOutline && this.currentExample) {
            this.lastScenarioOutline.examples = JSON.parse(JSON.stringify(this.currentExample))
        }

        return this.features
    }

    private getTextAfterKeyword (line: string, key: string): string {
        return line.split(`${key}:`)[1].trim()
    }

    private findStepDetails (line: string, stepType: string): string {
        return line.split(`${stepType}`)[1].trim()
    }

    private isStep (line: string): boolean {
        return Object
            .values(StepTypes)
            .some((value) => {
                return line.includes(value)
            })
    }

    private findStepType (line: string): StepTypes {
        const foundStep = Object
            .values(StepTypes)
            .find((value) => line.includes(value))

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return foundStep!
    }

    public get currentFeature (): Feature {
        return this.features[this.currentFeatureIndex]
    }

    public get currentScenario (): Scenario {
        return this.currentFeature.scenarii[this.currentScenarioIndex]
    }

}