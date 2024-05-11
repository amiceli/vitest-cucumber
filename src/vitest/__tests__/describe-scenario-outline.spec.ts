import {
    ScenarioOutlineVariableNotCalledInStepsError, ScenarioOulineWithoutExamplesError, MissingScenarioOutlineVariableValueError, ScenarioOutlineVariablesDeclaredWithoutExamplesError, 
} from "../../errors/errors"
import { Feature } from "../../parser/feature"
import { Step, StepTypes } from "../../parser/step"
import { describeFeature } from "../describe-feature"
import { ScenarioOutline as ScenarioOutlineType } from "../../parser/scenario"
import { Rule as RuleType } from "../../parser/Rule"

describe(`ScenarioOutline without variables in step`, () => {
    const feature = new Feature(`Use ScenarioOutline without variable in step`)
    const scenario = new ScenarioOutlineType(`I forgot Examples in step`)

    scenario.addStep(new Step(StepTypes.GIVEN, `I forgot to use variable`))

    scenario.examples.push(
        { height : 100 },
    )

    feature.addScenario(scenario)

    describeFeature(feature, ({ ScenarioOutline }) => {
        try {
            ScenarioOutline(`I forgot Examples in step`, ({ Given }) => {
                Given(`I forgot to use variable`, () => {
                    expect(true).toBeTruthy()
                })
            })
        } catch (e) {
            scenario.isCalled = true

            test(`Handle ScenarioOutline without variables in step`, () => {
                expect(e).toEqual(
                    new ScenarioOutlineVariableNotCalledInStepsError(
                        scenario, `height`,
                    ),
                )
            })
        }
    })
})

describe(`ScenarioOutline with empty examples`, () => {
    const feature = new Feature(`Use ScenarioOutline with empty examples`)
    const scenario = new ScenarioOutlineType(`I forgot Examples`)

    scenario.addStep(new Step(StepTypes.GIVEN, `I forgot to see examples`))

    feature.addScenario(scenario)

    describeFeature(feature, ({ ScenarioOutline }) => {
        try {
            ScenarioOutline(`I forgot Examples`, ({ Given }) => {
                Given(`I forgot to see examples`, () => {
                    expect(true).toBeTruthy()
                })
            })
        } catch (e) {
            scenario.isCalled = true

            test(`Handle ScenarioOutline without examples`, () => {
                expect(e).toEqual(
                    new ScenarioOulineWithoutExamplesError(scenario),
                )
            })
        }
    })
})


describe(`ScnearioOutline without variables`, () => {
    const feature = new Feature(`Use ScenarioOutline without variable in Examples`)
    const scenario = new ScenarioOutlineType(`I forgot Examples variables name`)

    scenario.addStep(new Step(StepTypes.GIVEN, `I love <height>`))

    scenario.examples.push({ height : undefined })

    feature.addScenario(scenario)

    describeFeature(feature, ({ ScenarioOutline }) => {
        try {
            ScenarioOutline(scenario.description, ({ Given }) => {
                Given(`I love <height>`, () => {
                    expect(true).toBeTruthy()
                })
            })
        } catch (e) {
            scenario.isCalled = true

            test(`Handle ScenarioOutline with missing Examples variables value`, () => {
                expect(e).toEqual(
                    new MissingScenarioOutlineVariableValueError(
                        scenario, `height`,
                    ),
                )
            })
        }
    })
})

describe(`ScnearioOutline examples use N times in Rule`, () => {
    const feature = new Feature(`test`)
    const scenario = new ScenarioOutlineType(`out line baby`)

    scenario.addStep(new Step(StepTypes.GIVEN, `I check <width>`))
    scenario.addStep(new Step(StepTypes.AND, `I check <height>`))

    scenario.examples.push(
        { width : 100, height : 200 },
        { width : 200, height : 400 },
    )

    const rule = new RuleType(`Example rule`)
    rule.addScenario(scenario)
    feature.addRule(rule)

    let examplesStepCount = 0

    describeFeature(feature, ({ Rule, AfterEachScenario }) => {
        AfterEachScenario(() => {
            examplesStepCount++
        })
        Rule(`Example rule`, ({ RuleScenarioOutline }) => {
            RuleScenarioOutline(`out line baby`, ({ Given, And }, variables) => {
                Given(`I check <width>`, () => {
                    expect(
                        variables.width,
                    ).toEqual(scenario.examples[examplesStepCount].width)
                })
                And(`I check <height>`, () => {
                    expect(
                        variables.height,
                    ).toEqual(scenario.examples[examplesStepCount].height)
                })
            })
        })
    })
})

describe(`ScenarioOutline examples use N times`, () => {
    const feature = new Feature(`test`)
    const scenario = new ScenarioOutlineType(`out line baby`)

    scenario.addStep(new Step(StepTypes.GIVEN, `I check <width>`))
    scenario.addStep(new Step(StepTypes.AND, `I check <height>`))

    scenario.examples.push(
        { width : 100, height : 200 },
        { width : 200, height : 400 },
    )

    feature.addScenario(scenario)
    let examplesStepCount = 0

    describeFeature(feature, ({ ScenarioOutline, AfterEachScenario }) => {
        AfterEachScenario(() => {
            examplesStepCount++
        })
        ScenarioOutline(`out line baby`, ({ Given, And }, variables) => {
            Given(`I check <width>`, () => {
                expect(
                    variables.width,
                ).toEqual(scenario.examples[examplesStepCount].width)
            })
            And(`I check <height>`, () => {
                expect(
                    variables.height,
                ).toEqual(scenario.examples[examplesStepCount].height)
            })
        })
    })
})

describe(`ScenarioOutline without Examples`, () => {
    const feature = new Feature(`Use ScenarioOutline without examples`)
    const scenario = new ScenarioOutlineType(`I forgot Examples`)

    scenario.addStep(new Step(StepTypes.GIVEN, `I forgot to see examples`))
    scenario.missingExamplesKeyword = true

    feature.addScenario(scenario)

    describeFeature(feature, ({ ScenarioOutline }) => {
        try {
            ScenarioOutline(`I forgot Examples`, ({ Given }) => {
                Given(`I forgot to see examples`, () => {
                    expect(true).toBeTruthy()
                })
            })
        } catch (e) {
            scenario.isCalled = true

            test(`Handle ScenarioOutline without examples`, () => {
                expect(e).toEqual(
                    new ScenarioOutlineVariablesDeclaredWithoutExamplesError(scenario),
                )
            })
        }
    })
})

describe(`ScenarioOutline with Examples`, () => {
    const feature = new Feature(`Use ScenarioOutline with examples`)
    const scenarioOutline = new ScenarioOutlineType(`I use variables`)

    scenarioOutline.examples.push(
        {
            width : 100, height : 200, sum : 300,
        },
        {
            width : 200, height : 400, sum : 600,
        },
    )


    scenarioOutline.addStep(new Step(StepTypes.GIVEN, `I know <width> value`))
    scenarioOutline.addStep(new Step(StepTypes.AND, `I know <height> value`))
    scenarioOutline.addStep(new Step(StepTypes.THEN, `I can make a <sum>`))


    feature.addScenario(scenarioOutline)

    describeFeature(feature, ({ ScenarioOutline, AfterEachScenario, AfterAllScenarios }) => {
        let scenarioOutlineCount = 0

        AfterEachScenario(() => {
            scenarioOutlineCount++
        })

        AfterAllScenarios(() => {
            expect(scenarioOutlineCount).toBe(
                scenarioOutline.examples.length,
            )
        })

        ScenarioOutline(`I use variables`, ({ Given, And, Then }, variables) => {
            Given(`I know <width> value`, () => {
                expect(parseInt(variables.width) >= 100).toBeTruthy()
            })
            And(`I know <height> value`, () => {
                expect(parseInt(variables.height) >= 100).toBeTruthy()
            })
            Then(`I can make a <sum>`, () => {
                expect(
                    parseInt(variables.width) + parseInt(variables.height),
                ).toEqual(
                    variables.sum,
                )
            })
        })
    })
})