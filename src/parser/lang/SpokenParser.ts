import { StepTypes } from '../step'
import avalaibleLanguages from './lang.json'

type GherkinLanguageDetails = {
    and: string[]
    background: string[]
    but: string[]
    examples: string[]
    feature: string[]
    given: string[]
    rule: string[]
    scenario: string[]
    scenarioOutline: string[]
    then: string[]
    when: string[]
}

type GherkinLanguage = {
    [key: string]: GherkinLanguageDetails
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export abstract class SpokenParserFactory {
    public static fromLang(lang: string): SpokenParser {
        const details = (avalaibleLanguages as GherkinLanguage)[lang]
        const defaultDetails = (avalaibleLanguages as GherkinLanguage).en

        if (details) {
            return new SpokenParser(details)
        }

        return new SpokenParser(defaultDetails)
    }
}

type SpokenStepMatch = Array<{
    type: StepTypes
    keys: string[]
}>

export class SpokenParser {
    public readonly details: GherkinLanguageDetails

    public constructor(details: GherkinLanguageDetails) {
        this.details = details
    }

    public isScenario(line: string): boolean {
        return (
            this.details.scenario.find((value) => {
                return line.startsWith(value)
            }) !== undefined
        )
    }

    public isBackground(line: string): boolean {
        return (
            this.details.background.find((value) => {
                return line.startsWith(value)
            }) !== undefined
        )
    }

    public getStepType(line: string): StepTypes {
        const foundStep = this.stepsMatch.find((stepDetails) => {
            return stepDetails.keys.some((stepKey) => {
                return line.startsWith(stepKey)
            })
        })

        if (foundStep) {
            return foundStep.type
        }

        throw new Error('Type not found')
    }

    private get stepsMatch(): SpokenStepMatch {
        return [
            { type: StepTypes.GIVEN, keys: this.details.given },
            { type: StepTypes.WHEN, keys: this.details.when },
            { type: StepTypes.THEN, keys: this.details.then },
            { type: StepTypes.AND, keys: this.details.and },
            { type: StepTypes.BUT, keys: this.details.but },
        ]
    }
}
