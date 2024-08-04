import { describe, expect } from 'vitest'
import { FeatureContentReader } from '../../__mocks__/FeatureContentReader.spec'
import {
    MissingScenarioOutlineVariableValueError,
    ScenarioOulineWithoutExamplesError,
    ScenarioOutlineVariableNotCalledInStepsError,
    ScenarioOutlineVariablesDeclaredWithoutExamplesError,
} from '../../errors/errors'
import type { ScenarioOutline as ScenarioOutlineType } from '../../parser/scenario'
import { describeFeature } from '../describe-feature'

describe(`ScenarioOutline without variables in step`, () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Use ScenarioOutline without variable in step`,
        `      Scenario Outline: I forgot Examples in step`,
        `          Given I forgot to use variable`,
        ``,
        `          Examples:`,
        `              | height |`,
        `              | 100    |`,
    ]).parseContent()

    expect(() => {
        describeFeature(feature, ({ ScenarioOutline }) => {
            ScenarioOutline(`I forgot Examples in step`, ({ Given }) => {
                Given(`I forgot to use variable`, () => {
                    expect(true).toBeTruthy()
                })
            })
        })
    }).toThrowError(
        new ScenarioOutlineVariableNotCalledInStepsError(
            feature.scenarii[0] as ScenarioOutlineType,
            `height`,
        ),
    )
})

describe(`ScenarioOutline with empty examples`, () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Use ScenarioOutline with empty examples`,
        `      Scenario Outline: I forgot Examples`,
        `          Given I forgot to see examples`,
        ``,
    ]).parseContent()

    expect(() => {
        describeFeature(feature, ({ ScenarioOutline }) => {
            ScenarioOutline(`I forgot Examples`, ({ Given }) => {
                Given(`I forgot to see examples`, () => {
                    expect(true).toBeTruthy()
                })
            })
        })
    }).toThrowError(
        new ScenarioOulineWithoutExamplesError(
            feature.scenarii[0] as ScenarioOutlineType,
        ),
    )
})

describe(`ScnearioOutline without variables`, () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Use ScenarioOutline without variable in Examples`,
        `      Scenario Outline: I forgot Examples variables name`,
        `          Given I love <height>`,
        ``,
        `          Examples:`,
        `              | height |`,
    ]).parseContent()

    expect(() => {
        describeFeature(feature, ({ ScenarioOutline }) => {
            ScenarioOutline(`I forgot Examples variables name`, ({ Given }) => {
                Given(`I love <height>`, () => {
                    expect(true).toBeTruthy()
                })
            })
        })
    }).toThrowError(
        new MissingScenarioOutlineVariableValueError(
            feature.scenarii[0] as ScenarioOutlineType,
            `height`,
        ),
    )
})

describe(`ScnearioOutline examples use N times in Rule`, () => {
    const feature = FeatureContentReader.fromString([
        `Feature: test`,
        `      Rule: Example rule`,
        `          Scenario Outline: out line baby`,
        `              Given I check <width>`,
        `              And   I check <height>`,
        ``,
        `              Examples:`,
        `                  | width | height |`,
        `                  | 100   | 200    |`,
        `                  | 200   | 400    |`,
    ]).parseContent()

    let examplesStepCount = 0
    const [scenario] = feature.rules[0].scenarii as ScenarioOutlineType[]

    describeFeature(feature, ({ Rule, AfterEachScenario }) => {
        AfterEachScenario(() => {
            examplesStepCount++
        })
        Rule(`Example rule`, ({ RuleScenarioOutline }) => {
            RuleScenarioOutline(
                `out line baby`,
                ({ Given, And }, variables) => {
                    Given(`I check <width>`, () => {
                        expect(variables.width).toEqual(
                            scenario.examples[examplesStepCount].width,
                        )
                    })
                    And(`I check <height>`, () => {
                        expect(variables.height).toEqual(
                            scenario.examples[examplesStepCount].height,
                        )
                    })
                },
            )
        })
    })
})

describe(`ScenarioOutline examples use N times`, () => {
    const feature = FeatureContentReader.fromString([
        `Feature: test`,
        `      Scenario Outline: out line baby`,
        `          Given I check <width>`,
        `          And   I check <height>`,
        ``,
        `          Examples:`,
        `              | width | height |`,
        `              | 100   | 200    |`,
        `              | 200   | 400    |`,
    ]).parseContent()

    let examplesStepCount = 0
    const [scenario] = feature.scenarii as ScenarioOutlineType[]

    describeFeature(feature, ({ ScenarioOutline, AfterEachScenario }) => {
        AfterEachScenario(() => {
            examplesStepCount++
        })
        ScenarioOutline(`out line baby`, ({ Given, And }, variables) => {
            Given(`I check <width>`, () => {
                expect(variables.width).toEqual(
                    scenario.examples[examplesStepCount].width,
                )
            })
            And(`I check <height>`, () => {
                expect(variables.height).toEqual(
                    scenario.examples[examplesStepCount].height,
                )
            })
        })
    })
})

describe(`ScenarioOutline without Examples`, () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Use ScenarioOutline without examples`,
        `      Scenario Outline: I forgot Examples`,
        `          Given I forgot to see examples`,
        ``,
        `          | height |`,
        `          | 100   |`,
        ``,
    ]).parseContent()

    expect(() => {
        describeFeature(feature, ({ ScenarioOutline }) => {
            ScenarioOutline(`I forgot Examples`, ({ Given }) => {
                Given(`I forgot to see examples`, () => {
                    expect(true).toBeTruthy()
                })
            })
        })
    }).toThrowError(
        new ScenarioOutlineVariablesDeclaredWithoutExamplesError(
            feature.scenarii[0] as ScenarioOutlineType,
        ),
    )
})

describe(`ScenarioOutline with Examples`, () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Use ScenarioOutline with examples`,
        `      Scenario Outline: I use variables`,
        `          Given I know <width> value`,
        `          And   I know <height> value`,
        `          Then  I can make a <sum>`,
        ``,
        `          Examples:`,
        `              | width | height | sum |`,
        `              | 100   | 200    | 300 |`,
        `              | 200   | 400    | 600 |`,
    ]).parseContent()

    const [scenarioOutline] = feature.scenarii as ScenarioOutlineType[]

    describeFeature(
        feature,
        ({ ScenarioOutline, AfterEachScenario, AfterAllScenarios }) => {
            let scenarioOutlineCount = 0

            AfterEachScenario(() => {
                scenarioOutlineCount++
            })

            AfterAllScenarios(() => {
                expect(scenarioOutlineCount).toBe(
                    scenarioOutline.examples.length,
                )
            })

            ScenarioOutline(
                `I use variables`,
                ({ Given, And, Then }, variables) => {
                    Given(`I know <width> value`, () => {
                        expect(
                            Number.parseInt(variables.width) >= 100,
                        ).toBeTruthy()
                    })
                    And(`I know <height> value`, () => {
                        expect(
                            Number.parseInt(variables.height) >= 100,
                        ).toBeTruthy()
                    })
                    Then(`I can make a <sum>`, () => {
                        expect(
                            Number.parseInt(variables.width) +
                                Number.parseInt(variables.height),
                        ).toEqual(Number.parseInt(variables.sum, 10))
                    })
                },
            )
        },
    )
})
