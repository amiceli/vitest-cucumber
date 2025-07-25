import { RequiredTitleError, SpokenKeywordError } from '../../errors/errors'
import { StepTypes } from '../models/step'
import availableLanguages from './lang.json'

type Languages = keyof typeof availableLanguages
type GherkinLanguageDetails = (typeof availableLanguages)['en']

type LineDetails = {
    keyword: string
    title: string
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export abstract class SpokenParserFactory {
    public static fromLang(lang: string): SpokenParser {
        const details =
            lang in availableLanguages
                ? availableLanguages[lang as Languages]
                : availableLanguages.en

        return new SpokenParser(details)
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

    public getFeatureName(line: string): LineDetails {
        return this.getMatchKey({
            line,
            keys: this.details.feature,
            titleRequired: true,
        })
    }

    public getScenarioName(line: string): LineDetails {
        return this.getMatchKey({
            line,
            keys: this.details.scenario,
            titleRequired: true,
        })
    }

    public getScenarioOutlineName(line: string): LineDetails {
        return this.getMatchKey({
            line,
            keys: this.details.scenarioOutline,
            titleRequired: true,
        })
    }

    public getRuleName(line: string): LineDetails {
        return this.getMatchKey({
            line,
            keys: this.details.rule,
            titleRequired: true,
        })
    }

    public getBackgroundKeyWord(line: string): string {
        return this.getMatchKey({
            line,
            keys: this.details.background,
        }).keyword
    }

    private getMatchKey(options: {
        line: string
        keys: string[]
        titleRequired?: boolean
    }): LineDetails {
        const foundKeyword = options.keys.find((featureKey) =>
            options.line.trim().startsWith(`${featureKey}:`),
        )

        if (!foundKeyword) {
            throw new SpokenKeywordError(options.line, options.keys)
        }

        const title = options.line.split(`${foundKeyword}:`).at(1)?.trim()

        if (!title && options.titleRequired) {
            throw new RequiredTitleError(options.line.trim(), foundKeyword)
        }

        return {
            keyword: foundKeyword.trim(),
            title: title || '',
        }
    }

    // match line

    public isRule(line: string): boolean {
        return this.lineStartsWithOneOf(this.details.rule, line)
    }

    public isExamples(line: string): boolean {
        return this.lineStartsWithOneOf(this.details.examples, line)
    }

    public isFeature(line: string): boolean {
        return this.lineStartsWithOneOf(this.details.feature, line)
    }

    public isScenarioOutline(line: string): boolean {
        return this.lineStartsWithOneOf(this.details.scenarioOutline, line)
    }

    public isScenario(line: string): boolean {
        return this.lineStartsWithOneOf(this.details.scenario, line)
    }

    public isBackground(line: string): boolean {
        return this.lineStartsWithOneOf(this.details.background, line)
    }

    public isStep(line: string): boolean {
        return this.foundStep(line) !== undefined
    }

    public getStepDetails(line: string, type: StepTypes): LineDetails {
        const matches = this.stepsMatch.find((s) => s.type === type)
        const foundMatch = matches?.keys.find((stepKey) => {
            return line.trim().startsWith(stepKey)
        })

        if (foundMatch) {
            return {
                keyword: foundMatch.trim(),
                title: line.trim().split(foundMatch)[1].trim(),
            }
        }

        throw new SpokenKeywordError(line, matches?.keys || [])
    }

    public getStepType(line: string): StepTypes {
        const foundStep = this.foundStep(line)

        if (foundStep) {
            return foundStep.type
        }

        throw new Error('Type not found')
    }

    private foundStep(line: string): SpokenStepMatch[0] | undefined {
        return this.stepsMatch.find((stepDetails) => {
            return stepDetails.keys.some((stepKey) => {
                return line.trim().startsWith(stepKey)
            })
        })
    }

    private lineStartsWithOneOf(keys: string[], line: string): boolean {
        return (
            keys.find((value) => {
                return line.trim().startsWith(`${value}:`)
            }) !== undefined
        )
    }

    private get stepsMatch(): SpokenStepMatch {
        return [
            {
                type: StepTypes.GIVEN,
                keys: this.details.given,
            },
            {
                type: StepTypes.WHEN,
                keys: this.details.when,
            },
            {
                type: StepTypes.THEN,
                keys: this.details.then,
            },
            {
                type: StepTypes.AND,
                keys: this.details.and,
            },
            {
                type: StepTypes.BUT,
                keys: this.details.but,
            },
        ]
    }
}
