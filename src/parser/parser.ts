import {
    MissingExamplesError,
    MissingFeature,
    MissingScnearioOutlineError,
    MissingSteppableError,
    OnlyOneFeatureError,
    TwiceBackgroundError,
} from '../errors/errors'
import type {
    RequiredVitestCucumberOptions,
    VitestCucumberOptions,
} from '../vitest/configuration'
import { type SpokenParser, SpokenParserFactory } from './lang/SpokenParser'
import { Background } from './models/Background'
import { Feature } from './models/feature'
import { Rule } from './models/Rule'
import type { StepAble } from './models/Stepable'
import { type Example, Scenario, ScenarioOutline } from './models/scenario'
import { Step, type StepDataTanle } from './models/step'
import type { Taggable } from './models/Taggable'

type SteppableName = 'Scenario' | 'ScenarioOutline' | 'Background'

export type ParserOptions = Pick<VitestCucumberOptions, 'language'>
export type RequiredParserOptions = Pick<
    RequiredVitestCucumberOptions,
    'language'
>

enum FeatureActions {
    FEATURE = 'Feature',
    SCENARIO = 'Scenario',
    BACKGROUND = 'Background',
    STEP = 'Step',
    RULE = 'Rule',
    EXAMPLES = 'Examples',
}

export class GherkinParser {
    private readonly spokenParser: SpokenParser

    public readonly features: Feature[] = []

    private currentFeatureIndex: number = -1

    private currentScenarioIndex: number = -1

    private currentRulenIndex: number = -1

    private lastScenarioOutline: ScenarioOutline | null = null

    private currentExample: Example | null = null

    private currentExampleLine: number = -1

    private exampleKeys: string[] = []

    private currentDataTable: StepDataTanle = []

    private currentStepDataTableLine: number = -1

    private dataTanleKeys: string[] = []

    private lastTags: string[] = []

    private lastSteppableTag: SteppableName | null = null

    private readonly currentDocStrings: string[] = []

    private parsingDocStrings: boolean = false

    private previousAction: FeatureActions | null = null

    private lastStep: Step | null = null

    private resetStepDataTable() {
        this.currentDataTable = []
        this.currentStepDataTableLine = -1
        this.dataTanleKeys = []
        this.lastStep = null
    }

    public constructor(options: RequiredParserOptions) {
        this.spokenParser = SpokenParserFactory.fromLang(options.language)
    }

    public hasFeature(line: string): boolean {
        if (!this.currentFeature) {
            throw new MissingFeature(line)
        }

        return true
    }

    public hasSteppable(line: string): boolean {
        if (!(this.currentBackground || this.currentScenario)) {
            throw new MissingSteppableError(line)
        }

        return true
    }

    public hasScenarioOutline(line: string): boolean {
        if (!this.lastScenarioOutline) {
            throw new MissingScnearioOutlineError(line)
        }

        return true
    }

    public previousActionIs(value: FeatureActions): boolean {
        return this.previousAction === value
    }

    public addLine(line: string) {
        if (line.trim().startsWith(`#`)) {
            return
        }
        if (this.previousActionIs(FeatureActions.STEP)) {
            if (this.lastStep) {
                this.lastStep.dataTables = this.currentDataTable
            }
        }
        if (this.parsingDocStrings && !this.isDocStrings(line)) {
            this.currentDocStrings.push(line.trim())
        } else if (this.spokenParser.isFeature(line)) {
            this.previousAction = FeatureActions.FEATURE
            this.resetStepDataTable()

            if (this.features.length > 0) {
                throw new OnlyOneFeatureError()
            }

            this.currentFeatureIndex++
            this.currentScenarioIndex = -1
            this.currentRulenIndex = -1
            this.currentExampleLine = -1

            const { title, keyword } = this.spokenParser.getFeatureName(line)
            const feature = new Feature(title, keyword)

            this.features.push(feature)

            this.addTagToParent(feature)
        } else if (this.spokenParser.isRule(line) && this.hasFeature(line)) {
            this.previousAction = FeatureActions.RULE
            this.resetStepDataTable()

            this.currentExampleLine = -1
            this.currentScenarioIndex = -1

            this.currentRulenIndex++

            const { title, keyword } = this.spokenParser.getRuleName(line)
            const rule = new Rule(title, keyword)

            this.addTagToParent(rule)
            this.currentFeature.addRule(rule)
        } else if (
            this.spokenParser.isScenarioOutline(line) &&
            this.hasFeature(line)
        ) {
            this.previousAction = FeatureActions.SCENARIO
            this.resetStepDataTable()

            this.currentScenarioIndex++

            const { title, keyword } =
                this.spokenParser.getScenarioOutlineName(line)
            const scenario = new ScenarioOutline(title, keyword)

            this.lastScenarioOutline = scenario
            this.lastSteppableTag = `ScenarioOutline`

            this.addScenarioToParent(scenario)
            this.addTagToParent(scenario)
        } else if (
            this.spokenParser.isExamples(line) &&
            this.hasScenarioOutline(line)
        ) {
            this.previousAction = FeatureActions.EXAMPLES
            this.currentExample = []
            this.resetStepDataTable()
        } else if (line.trim().startsWith(`|`)) {
            if (
                this.previousActionIs(FeatureActions.EXAMPLES) &&
                this.currentExample
            ) {
                this.detectMissingExamplesKeyword()
                this.updateScenarioExamples(line)
            } else if (this.previousActionIs(FeatureActions.STEP)) {
                this.updateStepDataTable(line)
            } else {
                throw new MissingExamplesError(line)
            }
        } else if (
            this.spokenParser.isScenario(line) &&
            this.hasFeature(line)
        ) {
            this.previousAction = FeatureActions.SCENARIO
            this.resetStepDataTable()
            this.currentScenarioIndex++

            const { title, keyword } = this.spokenParser.getScenarioName(line)
            const scenario = new Scenario(title, keyword)

            this.lastSteppableTag = `Scenario`

            this.addScenarioToParent(scenario)
            this.addTagToParent(scenario)
        } else if (
            this.spokenParser.isBackground(line) &&
            this.hasFeature(line)
        ) {
            this.previousAction = FeatureActions.BACKGROUND
            this.resetStepDataTable()

            if (this.currentBackground) {
                throw new TwiceBackgroundError()
            }

            const background = new Background(
                this.spokenParser.getBackgroundKeyWord(line),
            )
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
        } else if (
            !this.parsingDocStrings &&
            this.spokenParser.isStep(line) &&
            this.hasSteppable(line)
        ) {
            this.previousAction = FeatureActions.STEP
            this.resetStepDataTable()

            const stepType = this.spokenParser.getStepType(line)
            const { keyword, title } = this.spokenParser.getStepDetails(
                line,
                stepType,
            )
            const newStep = new Step(stepType, title, keyword)

            this.lastStep = newStep
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
            this.currentRule.addScenario(scenario)
        } else {
            this.currentFeature.addScenario(scenario)
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

        this.currentFeature?.mustHaveScenarioOrRules()

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

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    private getObjectWithValuesFromLine(line: string, keys: any) {
        const exampleVariables = this.getVariablesFromLine(line)
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const res = exampleVariables.reduce((acc: any, cur, index) => {
            // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
            return (acc[keys[index]] = cur), acc
        }, {})

        return res
    }

    private addTagToParent(parent: Taggable) {
        if (this.lastTags.length > 0) {
            for (const tag of this.lastTags) {
                parent.tags.add(tag)
            }
            this.lastTags = []
        }
    }

    private getEmptyExamplesValues() {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const res = this.exampleKeys.reduce((acc: any, cur, index) => {
            // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
            return (acc[this.exampleKeys[index]] = null), acc
        }, {})

        return res
    }

    private detectMissingExamplesKeyword() {
        if (this.currentExample === null && this.lastScenarioOutline) {
            this.lastScenarioOutline.missingExamplesKeyword = true
        }
    }

    private updateStepDataTable(line: string) {
        if (this.currentDataTable) {
            this.currentStepDataTableLine++

            if (this.currentStepDataTableLine === 0) {
                this.dataTanleKeys = this.getVariablesFromLine(line)
            } else {
                this.currentDataTable.push(
                    this.getObjectWithValuesFromLine(line, this.dataTanleKeys),
                )
            }
        }
    }

    private updateScenarioExamples(line: string) {
        if (this.currentExample) {
            this.currentExampleLine++

            if (this.currentExampleLine === 0) {
                this.exampleKeys = this.getVariablesFromLine(line)
            } else {
                this.currentExample.push(
                    this.getObjectWithValuesFromLine(line, this.exampleKeys),
                )
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
}
