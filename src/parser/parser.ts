import { Rule } from "./Rule"
import { Taggable } from "./Taggable"
import { Feature } from "./feature"
import {
    Example, Scenario, ScenarioOutline,
} from "./scenario"
import { Step, StepTypes } from "./step"

export class GherkinParser {

    public readonly features: Feature[] = []

    private currentFeatureIndex: number = -1

    private currentScenarioIndex: number = -1

    private currentRulenIndex: number = -1

    private lastScenarioOutline: ScenarioOutline | null = null

    private currentExample : Example | null = null

    private currentExampleLine : number = -1

    private exampleKeys : string[] = []

    private lastTags : string[] = []

    public addLine (line: string) {
        if (line.trim().startsWith(`#`)) {
            return
        } 
        if (line.includes(`Feature:`)) {
            this.currentFeatureIndex++
            this.currentScenarioIndex = -1
            this.currentRulenIndex = -1
            this.currentExampleLine = -1

            const featureName = this.getTextAfterKeyword(line, `Feature`)
            const feature = new Feature(featureName)

            this.features.push(feature)

            this.addTagToParent(feature)
        }  else if (line.includes(`Rule:`)) {
            this.currentExampleLine = -1
            this.currentScenarioIndex = -1

            this.currentRulenIndex++

            const ruleName = this.getTextAfterKeyword(line, `Rule`)
            const rule = new Rule(ruleName)

            this.addTagToParent(rule)
            this.currentFeature.rules.push(rule)
        } else if (line.includes(`Scenario Outline:`)) {
            this.currentScenarioIndex++

            const scenarioName = this.getTextAfterKeyword(line, `Scenario Outline`)
            const scneario = new ScenarioOutline(scenarioName)

            if (this.currentRule) {
                this.currentRule.scenarii.push(scneario)
            } else {
                this.currentFeature.scenarii.push(scneario)
            }

            this.lastScenarioOutline = scneario
            this.addTagToParent(scneario)
        } else if (line.includes(`Examples:`)) {
            this.currentExample = []
        } else if (line.trim().startsWith(`|`)) {
            this.detectMissingExamplesKeyword()
            this.updateScenarioExamples(line)
        } else if (line.includes(`Scenario:`)) {
            this.currentScenarioIndex++

            const scenarioName = this.getTextAfterKeyword(line, `Scenario`)
            const scneario = new Scenario(scenarioName)

            if (this.currentRule) {
                this.currentRule.scenarii.push(scneario)
            } else {
                this.currentFeature.scenarii.push(scneario)
            }

            this.addTagToParent(scneario)
        } else if (line.trim().startsWith(`@`)) {
            this.lastTags.push(
                ...line
                    .split(` `)
                    .filter((l) => l.startsWith(`@`))
                    .map((l) => l.replace(`@`, ``)),
            )
        } else if (this.isStep(line)) {
            const stepType = this.findStepType(line)
            const stepDetails = this.findStepDetails(line, stepType)
            const newStep = new Step(stepType, stepDetails)

            this.currentScenario.steps.push(newStep)
        } else if (this.currentExample !== null) {
            if (this.currentExample.length === 0) {
                this.currentExample.push( this.getEmptyExamplesValues() )
            }
            if (this.lastScenarioOutline) {
                this.lastScenarioOutline.examples = JSON.parse(JSON.stringify(this.currentExample))
            }

            this.currentExample = null
            this.currentExampleLine = -1
        }
    }

    public finish (): Feature[] {
        if (this.lastScenarioOutline && this.currentExample) {
            if (this.currentExample.length === 0) {
                this.currentExample.push( this.getEmptyExamplesValues() )
            }

            this.lastScenarioOutline.examples = JSON.parse(JSON.stringify(this.currentExample))
        }

        return this.features
    }

    private getVariablesFromLine (line : string) {
        const exampleVariables = line
            .trim()
            .split(`|`)
            .filter((n) => n.length > 0)
            .map((n) => n.trim())

        return exampleVariables
    }

    private getObjectWithValuesFromLine (line : string) {
        const exampleVariables = this.getVariablesFromLine(line)
        const res = exampleVariables.reduce((acc : any, cur, index) => {
            return acc[this.exampleKeys[index]] = cur, acc
        }, {})

        return res
    }

    private addTagToParent (parent : Taggable) {
        if (this.lastTags.length > 0) {
            parent.tags.push(
                ...this.lastTags,
            )
            this.lastTags = []
        }
    }

    private getEmptyExamplesValues () {
        const res = this.exampleKeys.reduce((acc : any, cur, index) => {
            return acc[this.exampleKeys[index]] = null, acc
        }, {})

        return res
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

    private detectMissingExamplesKeyword () {
        if (this.currentExample === null && this.lastScenarioOutline) {
            this.lastScenarioOutline.missingExamplesKeyword = true
        }
    }

    private updateScenarioExamples (line : string) {
        if (this.currentExample) {
            this.currentExampleLine++

            if (this.currentExampleLine === 0) {
                this.exampleKeys = this.getVariablesFromLine(line)
            } else {
                this.currentExample.push(
                    this.getObjectWithValuesFromLine(line),
                )
            }
        }
    }

    public get currentRule (): Rule | undefined {
        return this.currentFeature.rules[this.currentRulenIndex]
    }

    public get currentFeature (): Feature {
        return this.features[this.currentFeatureIndex]
    }

    public get currentScenario (): Scenario {
        if (this.currentRule) {
            return this.currentRule.scenarii[this.currentScenarioIndex]
        } else {
            return this.currentFeature.scenarii[this.currentScenarioIndex]
        }
    }

}