import { FeatureFileReader } from "../readfile"
import {
    describe, expect, test, vi, beforeEach, 
} from 'vitest'
import { Step, StepTypes } from "../step"
import { GherkinParser } from "../parser"
import { BackgroundNotExistsError } from "../../errors/errors"
import { Feature } from "../feature"

describe(`Parse feature file`, () => {

    const path = `src/parser/__tests__/readline.feature`
    let reader : FeatureFileReader

    beforeEach(() => {
        vi.clearAllMocks()

        reader = FeatureFileReader.fromPath(path)
    })
    
    test(`One feature should be parsed`, async () => {
        const features = await reader.parseFile()
        const [feature] = features
        
        expect(features.length).toEqual(1)
        expect(feature.name).toEqual(`Use Gherkin in my unit tests`)
    })

    test(`Feature should have one Scenario`, async () => {
        const features = await reader.parseFile()
        const [feature] = features
        const [scenario] = feature.scenarii

        expect(feature.scenarii.length).toEqual(1)
        expect(scenario.description).toEqual(`Detect when step isn't tested`)
        expect(scenario.isCalled).toBeFalsy()
    })

    test(`Scenario should have 5 steps`, async () => {
        const features = await reader.parseFile()
        const [feature] = features
        const [scenario] = feature.scenarii

        const [
            Given,
            When,
            And,
            Then,
            LastAnd,
        ] = scenario.steps

        expect(scenario.steps.length).toEqual(5)
        expect(
            scenario.steps.every((s: Step) => !s.isCalled),
        ).toBeTruthy()

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

    test(`should stop at first parse error`, async () => {
        const expectedError = new BackgroundNotExistsError(
            new Feature(`test`),
        )
        const addLine = vi.spyOn(GherkinParser.prototype, `addLine`).mockImplementation(() => {
            throw expectedError
        })

        try {
            await reader.parseFile()
            test.fails(`should not continue`)
        } catch (e) {
            expect(e).toEqual(expectedError)
            expect(addLine).not.toHaveBeenCalledTimes(1)
        }
    })

})