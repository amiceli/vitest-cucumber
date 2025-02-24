import { describe, expect } from 'vitest'
import { FeatureContentReader } from '../../__mocks__/FeatureContentReader.spec'
import { describeFeature } from '../../vitest/describe-feature'
import {
    getVitestCucumberConfiguration,
    setVitestCucumberConfiguration,
} from '../configuration'

setVitestCucumberConfiguration({
    ...getVitestCucumberConfiguration(),
    mappedExamples: {
        'front-end': 'front',
        'back-end': 'back',
        useful: true,
        useless: false,
    },
})

describe('Mapped examples', () => {
    describe(`ScenarioOutline`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: Mapped examples`,
            `    Scenario Outline: Mapped examples`,
            `        Given I am <type> developper`,
            `        Then Figma is <state>`,
            `        But  Git is <other-state>`,
            `        Examples:`,
            `           | type      | state   | other-state |`,
            `           | front-end | useful  | required    |`,
            `           | back-end  | useless | required    |`,
        ]).parseContent()

        describeFeature(feature, (f) => {
            f.ScenarioOutline(`Mapped examples`, (s, variables) => {
                s.Given(`I am <type> developper`, () => {
                    expect(['front', 'back']).toContain(variables.type)
                })
                s.Then(`Figma is <state>`, () => {
                    expect([true, false]).toContain(variables.state)
                })
                s.But('Git is <other-state>', () => {
                    expect(variables['other-state']).toEqual('required')
                })
            })
        })
    })
})
