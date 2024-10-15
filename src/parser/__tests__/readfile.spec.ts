import { describe, expect, test } from 'vitest'
import { getVitestCucumberConfiguration } from '../../vitest/configuration'
import { type Step, StepTypes } from '../models/step'
import { FeatureFileReader } from '../readfile'

describe(`Parse feature file`, async () => {
    const path = `src/parser/__tests__/readline.feature`
    const features = await FeatureFileReader.fromPath({
        featureFilePath: path,
        options: getVitestCucumberConfiguration(),
    }).parseFile()

    const [feature] = features
    const [scenario] = feature.scenarii

    test(`One feature should be parsed`, () => {
        expect(features.length).toEqual(1)
        expect(feature.name).toEqual(`Use Gherkin in my unit tests`)
    })

    test(`Feature should have one Scenario`, () => {
        expect(feature.scenarii.length).toEqual(1)
        expect(scenario.description).toEqual(`Detect when step isn't tested`)
        expect(scenario.isCalled).toBeFalsy()
    })

    test(`Scenario should have 5 steps`, () => {
        const [Given, When, And, Then, LastAnd] = scenario.steps

        expect(scenario.steps.length).toEqual(5)
        expect(scenario.steps.every((s: Step) => !s.isCalled)).toBeTruthy()

        expect(Given.type).toEqual(StepTypes.GIVEN)
        expect(Given.details).toEqual(`Front end developer using vitest`)

        expect(When.type).toEqual(StepTypes.WHEN)
        expect(When.details).toEqual(`I run my unit tests with vitest`)

        expect(And.type).toEqual(StepTypes.AND)
        expect(And.details).toEqual(`I forgot to test my Given scenario step`)

        expect(Then.type).toEqual(StepTypes.THEN)
        expect(Then.details).toEqual(`My test failed`)

        expect(LastAnd.type).toEqual(StepTypes.AND)
        expect(LastAnd.details).toEqual(`I know with step I forgot`)
    })
})
