import {
    test, describe, expect, 
} from "vitest"
import { BackgroundNotExistsError, NotScenarioOutlineError } from '../errors'
import { Scenario } from "../../parser/scenario"
import { Feature } from "../../parser/feature"
import { Rule } from "../../parser/Rule"

describe(`errors`, () => {

    test(`Error without stack`, () => {
        const scenario = new Scenario(`test`)
        const error = new NotScenarioOutlineError(scenario)

        expect(error.stack).toEqual(``)
        expect(error.name).toEqual(NotScenarioOutlineError.name)
    })

    test(`BackgroundNotExistsError`, () => {
        const feature = new Feature(`test`)
        const rule = new Rule(`rule`)

        expect(
            (new BackgroundNotExistsError(feature)).message,
        ).toEqual(`Feature: test hasn't background`)
        expect(
            (new BackgroundNotExistsError(rule)).message,
        ).toEqual(`Rule: rule hasn't background`)
    })

})