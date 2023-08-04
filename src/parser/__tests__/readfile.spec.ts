import { FeatureFileReader } from "../readfile";
import {
    describe, expect, test
} from 'vitest'
import { Step, stepNames } from "../step";

describe('Parse feature file', async () => {

    const path = 'src/parser/__tests__/readline.feature'
    const features = await FeatureFileReader
        .fromPath(path)
        .parseFile()

    const [feature] = features
    const [scenario] = feature.scenarii

    test('One feature should be parsed', () => {
        expect(features.length).toEqual(1)
        expect(feature.name).toEqual(`Use Gherkin in my unit tests`)
    })

    test('Feature should have one Scenario', () => {
        expect(feature.scenarii.length).toEqual(1)
        expect(scenario.name).toEqual(`Detect when step isn't tested`)
        expect(scenario.isCalled).toBeFalsy()
    })

    test('Scenario should have 5 steps', () => {
        const [
            Given,
            When,
            And,
            Then,
            LastAnd,
        ] = scenario.steps

        expect(scenario.steps.length).toEqual(5)
        expect(
            scenario.steps.every((s : Step) => !s.isCalled)
        ).toBeTruthy()

        expect(Given.name).toEqual(stepNames.GIVEN)
        expect(Given.title).toEqual(`Front end developer using vitest`)

        expect(When.name).toEqual(stepNames.WHEN)
        expect(When.title).toEqual(`I run my unit tests with vitest`)

        expect(And.name).toEqual(stepNames.AND)
        expect(And.title).toEqual(`I forgot to test my Given scenario step`)

        expect(Then.name).toEqual(stepNames.THEN)
        expect(Then.title).toEqual(`My test failed`)

        expect(LastAnd.name).toEqual(stepNames.AND)
        expect(LastAnd.title).toEqual(`I know with step I forgot`)
    })

})