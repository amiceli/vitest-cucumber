import { describe, expect } from 'vitest'
import { FeatureContentReader } from '../../../__mocks__/FeatureContentReader.spec'
import { describeFeature } from '../../describe-feature'
import type { StepTest } from '../../types'

describe('Scenario.skip', () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Scenario.skip`,
        `   Scenario: use scenario context`,
        `       Given I have a scenario context`,
        `       When  I update scenario context`,
        `       Then  I can check it`,
        ``,
    ]).parseContent()

    type AwesomeContext = {
        updated: boolean
    }

    function defineGiven(steppable: StepTest<AwesomeContext>) {
        steppable.Given('I have a scenario context', () => {
            expect(steppable.context).toEqual({
                updated: false,
            })
        })
    }

    function defineWhen(steppable: StepTest<AwesomeContext>) {
        steppable.When('I update scenario context', () => {
            steppable.context.updated = true
        })
    }

    describeFeature(feature, (f) => {
        f.Scenario('use scenario context', (s: StepTest<AwesomeContext>) => {
            s.context.updated = false
            defineGiven(s)
            defineWhen(s)
            s.Then('I can check it', () => {
                expect(s.context.updated).toBe(true)
            })
        })
    })
})
