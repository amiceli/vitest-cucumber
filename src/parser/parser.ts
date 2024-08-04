import { OnlyOneFeatureError, TwiceBackgroundError } from '../errors/errors'
import { Background } from './Background'
import { Rule } from './Rule'
import type { StepAble } from './Stepable'
import type { Taggable } from './Taggable'
import { Feature } from './feature'
import { type Example, Scenario, ScenarioOutline } from './scenario'
import { Step, StepTypes } from './step'

type SteppableName = 'Scenario' | 'ScenarioOutline' | 'Background'
export class GherkinParser {
    public readonly features: Feature[] = []

    private currentFeatureIndex: number = -1

    private currentScenarioIndex: number = -1

    private currentRulenIndex: number = -1

    private lastScenarioOutline: ScenarioOutline | null = null

    private currentExample: Example | null = null

    private currentExampleLine: number = -1

    private exampleKeys: string[] = []

    private lastTags: string[] = []

    private lastSteppableTag: SteppableName | null = null

    private readonly currentDocStrings: string[] = []

    private parsingDocStrings: boolean = false

    public addLine(line: string) {
        if (line.trim().startsWith(`#`)) {
            return
        }
        if (line.includes(`Feature:`)) {
            if (this.features.length > 0) {
                throw new OnlyOneFeatureError()
            }

            this.currentFeatureIndex++
            this.currentScenarioIndex = -1
            this.currentRulenIndex = -1
            this.currentExampleLine = -1

            const featureName = this.getTextAfterKeyword(line, `Feature`)
            const feature = new Feature(featureName)

            this.features.push(feature)

            this.addTagToParent(feature)
        } else if (line.includes(`Rule:`)) {
            this.currentExampleLine = -1
            this.currentScenarioIndex = -1

            this.currentRulenIndex++

            const ruleName = this.getTextAfterKeyword(line, `Rule`)
            const rule = new Rule(ruleName)

            this.addTagToParent(rule)
            this.currentFeature.rules.push(rule)
        } else if (this.isScenarioOutlineLine(line)) {
            this.currentScenarioIndex++

            const scenarioName = this.getScenarioOutlineName(line)
            const scenario = new ScenarioOutline(scenarioName)

            this.lastScenarioOutline = scenario
            this.lastSteppableTag = `ScenarioOutline`

            this.addScenarioToParent(scenario)
            this.addTagToParent(scenario)
        } else if (this.isExamplesLine(line)) {
            this.currentExample = []
        } else if (line.trim().startsWith(`|`)) {
            this.detectMissingExamplesKeyword()
            this.updateScenarioExamples(line)
        } else if (this.isScenarioLine(line)) {
            this.currentScenarioIndex++

            const scenarioName = this.getScenarioName(line)
            const scenario = new Scenario(scenarioName)

            this.lastSteppableTag = `Scenario`

            this.addScenarioToParent(scenario)
            this.addTagToParent(scenario)
        } else if (line.includes(`Background:`)) {
            if (this.currentBackground) {
                throw new TwiceBackgroundError()
            }

            const background = new Background()
            this.lastSteppableTag = `Background`

            this.addBackgroundToParent(background)
            this.addTagToParent(background)
        } else if (line.trim().startsWith(`@`)) {
            this.lastTags.push(
                ...line
                    .split(` `)
                    .filter((l) => l.startsWith(`@`))
                    .map((l) => l.replace(`@`, ``)),
            )
        } else if (this.isDocStrings(line)) {
            if (this.parsingDocStrings) {
                this.currentScenario.lastStep.docStrings =
                    this.currentDocStrings.join(`\n`)
                this.parsingDocStrings = false
                this.currentDocStrings.splice(0, this.currentDocStrings.length)
            } else {
                this.parsingDocStrings = true
            }
        } else if (this.isStep(line)) {
            const stepType = this.findStepType(line)
            const stepDetails = this.findStepDetails(line, stepType)
            const newStep = new Step(stepType, stepDetails)

            this.currentScenario.addStep(newStep)
        } else if (this.currentExample !== null) {
            if (this.currentExample.length === 0) {
                this.currentExample.push(this.getEmptyExamplesValues())
            }
            if (this.lastScenarioOutline) {
                this.lastScenarioOutline.examples = JSON.parse(
                    JSON.stringify(this.currentExample),
                )
            }

            this.currentExample = null
            this.currentExampleLine = -1
        } else if (this.parsingDocStrings) {
            this.currentDocStrings.push(line.trim())
        }
    }

    private addBackgroundToParent(background: Background) {
        if (this.currentRule) {
            this.currentRule.background = background
        } else {
            this.currentFeature.background = background
        }
    }

    private addScenarioToParent(scenario: Scenario) {
        if (this.currentRule) {
            this.currentRule.scenarii.push(scenario)
        } else {
            this.currentFeature.scenarii.push(scenario)
        }
    }

    public finish(): Feature[] {
        if (this.lastScenarioOutline && this.currentExample) {
            if (this.currentExample.length === 0) {
                this.currentExample.push(this.getEmptyExamplesValues())
            }

            this.lastScenarioOutline.examples = JSON.parse(
                JSON.stringify(this.currentExample),
            )
        }

        return this.features
    }

    private getVariablesFromLine(line: string) {
        const exampleVariables = line
            .trim()
            .split(`|`)
            .filter((n) => n.length > 0)
            .map((n) => n.trim())

        return exampleVariables
    }

    private getObjectWithValuesFromLine(line: string) {
        const exampleVariables = this.getVariablesFromLine(line)
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const res = exampleVariables.reduce((acc: any, cur, index) => {
            // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
            // biome-ignore lint/style/noCommaOperator: <explanation>
            return (acc[this.exampleKeys[index]] = cur), acc
        }, {})

        return res
    }

    private addTagToParent(parent: Taggable) {
        if (this.lastTags.length > 0) {
            parent.tags.push(...this.lastTags)
            this.lastTags = []
        }
    }

    private getEmptyExamplesValues() {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const res = this.exampleKeys.reduce((acc: any, cur, index) => {
            // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
            // biome-ignore lint/style/noCommaOperator: <explanation>
            return (acc[this.exampleKeys[index]] = null), acc
        }, {})

        return res
    }

    private getTextAfterKeyword(line: string, key: string): string {
        return line.split(`${key}:`)[1].trim()
    }

    private findStepDetails(line: string, stepType: string): string {
        return line.split(`${stepType}`)[1].trim()
    }

    private isStep(line: string): boolean {
        if (this.parsingDocStrings) {
            return false
        }

        return Object.values(StepTypes).some((value) => {
            return line.trim().startsWith(value)
        })
    }

    private findStepType(line: string): StepTypes {
        const foundStep = Object.values(StepTypes).find((value) =>
            line.includes(value),
        )

        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        return foundStep!
    }

    private detectMissingExamplesKeyword() {
        if (this.currentExample === null && this.lastScenarioOutline) {
            this.lastScenarioOutline.missingExamplesKeyword = true
        }
    }

    private updateScenarioExamples(line: string) {
        if (this.currentExample) {
            this.currentExampleLine++

            if (this.currentExampleLine === 0) {
                this.exampleKeys = this.getVariablesFromLine(line)
            } else {
                this.currentExample.push(this.getObjectWithValuesFromLine(line))
            }
        }
    }

    public isDocStrings(line: string): boolean {
        return line.trim().startsWith(`"""`) || line.trim().startsWith(`\`\`\``)
    }

    public get currentBackground(): Background | null {
        if (this.currentRule) {
            return this.currentRule.background
        }

        return this.currentFeature.background
    }

    public get currentRule(): Rule | undefined {
        return this.currentFeature.rules[this.currentRulenIndex]
    }

    public get currentFeature(): Feature {
        return this.features[this.currentFeatureIndex]
    }

    public get currentScenario(): StepAble {
        if (this.lastSteppableTag === `Background` && this.currentBackground) {
            return this.currentBackground
        }
        if (this.currentRule) {
            return this.currentRule.scenarii[this.currentScenarioIndex]
        }

        return this.currentFeature.scenarii[this.currentScenarioIndex]
    }

    public isScenarioLine(line: string): boolean {
        return line.includes(`Scenario:`) || line.includes(`Example:`)
    }

    public isScenarioOutlineLine(line: string): boolean {
        return (
            line.includes(`Scenario Outline:`) ||
            line.includes(`Scenario Template:`)
        )
    }

    public isExamplesLine(line: string): boolean {
        return line.includes(`Examples:`) || line.includes(`Scenarios:`)
    }

    public getScenarioName(line: string): string {
        if (line.includes(`Example:`)) {
            return this.getTextAfterKeyword(line, `Example`)
        }

        return this.getTextAfterKeyword(line, `Scenario`)
    }

    public getScenarioOutlineName(line: string): string {
        if (line.includes(`Scenario Template:`)) {
            return this.getTextAfterKeyword(line, `Scenario Template`)
        }

        return this.getTextAfterKeyword(line, `Scenario Outline`)
    }
}
