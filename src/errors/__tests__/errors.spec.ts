import {
    test, describe, expect, 
} from "vitest"
import { NotScenarioOutlineError } from '../errors'
import { Scenario } from "../../parser/scenario"

describe(`errors`, () => {

    test(`Error without stack`, () => {
        const scenario = new Scenario(`test`)
        const error = new NotScenarioOutlineError(scenario)

        expect(error.stack).toEqual(``)
        expect(error.name).toEqual(NotScenarioOutlineError.name)
    })

})