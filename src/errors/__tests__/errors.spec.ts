import { describe, expect, test } from 'vitest'
import { Feature } from '../../parser/models/feature'
import { Rule } from '../../parser/models/Rule'
import { Scenario } from '../../parser/models/scenario'
import { BackgroundNotExistsError, NotScenarioOutlineError } from '../errors'

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

        expect(new BackgroundNotExistsError(feature).message).toEqual(
            `Feature: test has no background`,
        )
        expect(new BackgroundNotExistsError(rule).message).toEqual(
            `Rule: rule has no background`,
        )
    })
})
