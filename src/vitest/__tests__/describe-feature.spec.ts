import {
    MockInstance, expect, vi, test, describe, afterAll, beforeAll,
} from "vitest"
import { Feature } from "../../parser/feature"
import { ScenarioOutline as ScenarioOutlineType, Scenario as ScenarioType } from "../../parser/scenario"
import { Step, StepTypes } from "../../parser/step"
import { describeFeature } from '../describe-feature'
import {
    FeatureUknowScenarioError,
    IsScenarioOutlineError,
    MissingScenarioOutlineVariableValueError,
    NotScenarioOutlineError, ScenarioOulineWithoutExamplesError,
    ScenarioOutlineVariableNotCalledInStepsError,
    ScenarioOutlineVariablesDeclaredWithoutExamplesError, ScenarioUnknowStepError,
} from "../../errors/errors"
import { Rule as RuleType } from "../../parser/Rule"
import fs from 'fs/promises'
import { loadFeature } from '../load-feature'
import * as teardowns from "../describe/teardowns"

describe(`Scenario with bad type`, () => {
    const feature = new Feature(`Detect wrong scenario type`)
    const scenarioOutline = new ScenarioOutlineType(`I'm an outline scenario`)
    const scenario = new ScenarioType(`I'm a scenario`)

    scenarioOutline.steps.push(new Step(StepTypes.GIVEN, `A simple step`))
    scenario.steps.push(new Step(StepTypes.GIVEN, `A simple step`))

    feature.scenarii.push(scenarioOutline, scenario)

    describeFeature(feature, ({ Scenario, ScenarioOutline }) => {
        try {
            Scenario(`I'm an outline scenario`, () => { })
            test.fails(`Should not continue with wrong scenario type`)
        } catch (e) {
            scenarioOutline.isCalled = true

            test(`Developer should use ScenarioOutline instead of Scenario`, () => {
                expect(e).toEqual(
                    new IsScenarioOutlineError(
                        scenarioOutline,
                    ),
                )
            })
        }
        try {
            ScenarioOutline(`I'm a scenario`, ({ Given }) => {
                Given(`A simple step`, () => {
                    console.debug(`dan`)
                })
            })
        } catch (e) {
            scenario.isCalled = true

            test(`Developer should use Scenario instead of ScenarioOutline`, () => {
                expect(e).toEqual(
                    new NotScenarioOutlineError(
                        scenario,
                    ),
                )
            })
        }
    })
})

describe(`Check if scenario step exists`, () => {
    const featire = new Feature(`Check if step exists [checkIfScenarioExists]`)
    const scenario = new ScenarioType(`Example `)

    scenario.steps.push(
        new Step(StepTypes.WHEN, `Simple when`),
    )
    featire.scenarii.push(scenario)

    describeFeature(featire, ({ Scenario }) => {
        Scenario(scenario.description, ({ When, But }) => {
            try {
                When(`Simple when`, () => { })
                But(`I use bad step`, () => { })
            } catch (e) {
                test(`[checkIfScenarioExists] handle step not in scenario`, () => {
                    expect(e).toEqual(
                        new ScenarioUnknowStepError(
                            scenario,
                            new Step(StepTypes.BUT, `I use bad step`),
                        ),
                    )
                })
            }
        })
    })
})

describe(`Check if scenario exists`, () => {
    const feature = new Feature(`Check scenario exists [scenarioShouldNotBeOutline]`)

    describeFeature(feature, ({ Scenario }) => {
        try {
            Scenario(`Not in my featyre`, () => { })
        } catch (e) {
            test(`[scenarioShouldNotBeOutline] detect scenario not in feature`, () => {
                expect(e).toEqual(
                    new FeatureUknowScenarioError(
                        feature,
                        new ScenarioType(`Not in my featyre`),
                    ),
                )
            })
        }
    })
})

describe(`Async scenario hooks`, () => {
    const feature = new Feature(`Async scenario hook`)
    const scenario = new ScenarioType(`A simple Scenario`)

    scenario.steps.push(
        new Step(StepTypes.GIVEN, `Hooks are async`),
        new Step(StepTypes.THEN, `I wait hooks are finished`),
    )

    feature.scenarii.push(scenario)

    type ResolveArgs = (
        resolve: (value: void | PromiseLike<void>) => void
    ) => void

    function delayPromise (fn: ResolveArgs): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => { fn(resolve) }, 400)
        })
    }

    let beforeEachScenarioHookFinished = false
    let beforeAllScenarioHookFinished = false
    let afterEachScenarioHookFinished = false
    let afterAllScenarioHookFinished = true

    afterAll(() => {
        expect(afterAllScenarioHookFinished).toBeTruthy()
    })

    describeFeature(feature, ({ BeforeEachScenario, AfterEachScenario, BeforeAllScenarios, AfterAllScenarios, Scenario }) => {
        BeforeAllScenarios(async () => {
            await delayPromise((resolve) => {
                beforeAllScenarioHookFinished = true
                resolve()
            })
        })
        BeforeEachScenario(async () => {
            expect(beforeAllScenarioHookFinished).toBe(true)

            await delayPromise((resolve) => {
                beforeEachScenarioHookFinished = true
                resolve()
            })
        })
        AfterEachScenario(async () => {
            expect(beforeEachScenarioHookFinished).toBe(true)
            expect(beforeAllScenarioHookFinished).toBe(true)

            await delayPromise((resolve) => {
                afterEachScenarioHookFinished = true
                resolve()
            })
        })
        AfterAllScenarios(async () => {
            await delayPromise((resolve) => {
                expect(beforeEachScenarioHookFinished).toBe(true)
                expect(beforeAllScenarioHookFinished).toBe(true)
                expect(afterEachScenarioHookFinished).toBe(true)

                afterAllScenarioHookFinished = true
                resolve()
            })
        })
        Scenario(`A simple Scenario`, ({ Given, Then }) => {
            Given(`Hooks are async`, () => {
                expect(beforeEachScenarioHookFinished).toBeTruthy()
            })
            Then(`I wait hooks are finished`, () => {
                expect(beforeAllScenarioHookFinished).toBeTruthy()
            })
        })
    })
})

describe(`ScenarioOutline without variables in step`, () => {
    const feature = new Feature(`Use ScenarioOutline without variable in step`)
    const scenario = new ScenarioOutlineType(`I forgot Examples in step`)

    scenario.steps.push(
        new Step(StepTypes.GIVEN, `I forgot to use variable`),
    )

    scenario.examples.push(
        { height : 100 },
    )

    feature.scenarii.push(scenario)

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

    scenario.steps.push(
        new Step(StepTypes.GIVEN, `I forgot to see examples`),
    )

    feature.scenarii.push(scenario)

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

    scenario.steps.push(
        new Step(StepTypes.GIVEN, `I love <height>`),
    )

    scenario.examples.push({ height : undefined })

    feature.scenarii.push(scenario)

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

    scenario.steps.push(
        new Step(StepTypes.GIVEN, `I check <width>`),
        new Step(StepTypes.AND, `I check <height>`),
    )

    scenario.examples.push(
        { width : 100, height : 200 },
        { width : 200, height : 400 },
    )

    const rule = new RuleType(`Example rule`)
    rule.scenarii.push(scenario)
    feature.rules.push(rule)

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

    scenario.steps.push(
        new Step(StepTypes.GIVEN, `I check <width>`),
        new Step(StepTypes.AND, `I check <height>`),
    )

    scenario.examples.push(
        { width : 100, height : 200 },
        { width : 200, height : 400 },
    )

    feature.scenarii.push(scenario)
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

    scenario.steps.push(
        new Step(StepTypes.GIVEN, `I forgot to see examples`),
    )
    scenario.missingExamplesKeyword = true

    feature.scenarii.push(scenario)

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

    scenarioOutline.steps.push(
        new Step(StepTypes.GIVEN, `I know <width> value`),
        new Step(StepTypes.AND, `I know <height> value`),
        new Step(StepTypes.THEN, `I can make a <sum>`),
    )

    feature.scenarii.push(scenarioOutline)

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

describe(`Scneario hooks`, () => {
    const feature = new Feature(`Check scenario hooks`)
    const first = new ScenarioType(`First scenario`)
    const second = new ScenarioType(`Second scenario`)

    first.steps.push(
        new Step(StepTypes.THEN, `BeforeEachScenario should be called`),
        new Step(StepTypes.AND, `BeforeAllScenarios should be called`),
        new Step(StepTypes.BUT, `AfterEachScenario should not be called`),
        new Step(StepTypes.AND, `AfterAllScenarios should not be called`),
    )
    second.steps.push(
        new Step(StepTypes.THEN, `AfterEachScenario should be called`),
        new Step(StepTypes.AND, `AfterAllScenarios should not  be called`),
    )
    feature.scenarii.push(first, second)

    const spyBeforeEachScenario = vi.fn()
    const spyBeforeAllScenarios = vi.fn()
    const spyAfterEachScenario = vi.fn()
    const spyAfterAllScenarios = vi.fn()

    afterAll(() => {
        expect(spyAfterAllScenarios).toHaveBeenCalled()
    })

    describeFeature(
        feature,
        ({ Scenario, BeforeEachScenario, AfterEachScenario, AfterAllScenarios, BeforeAllScenarios }) => {
            BeforeEachScenario(() => { spyBeforeEachScenario() })
            BeforeAllScenarios(() => { spyBeforeAllScenarios() })
            AfterEachScenario(() => { spyAfterEachScenario() })
            AfterAllScenarios(() => { spyAfterAllScenarios() })

            Scenario(`First scenario`, ({ Then, And, But }) => {
                Then(`BeforeEachScenario should be called`, () => {
                    expect(spyBeforeEachScenario).toHaveBeenCalled()
                })
                And(`BeforeAllScenarios should be called`, () => {
                    expect(spyBeforeAllScenarios).toHaveBeenCalled()
                })
                But(`AfterEachScenario should not be called`, () => {
                    expect(spyAfterEachScenario).not.toHaveBeenCalled()
                })
                And(`AfterAllScenarios should not be called`, () => {
                    expect(spyAfterAllScenarios).not.toHaveBeenCalled()
                })
            })

            Scenario(`Second scenario`, ({ Then, And }) => {
                Then(`AfterEachScenario should be called`, () => {
                    expect(spyAfterEachScenario).toHaveBeenCalled()
                })
                And(`AfterAllScenarios should not  be called`, () => {
                    expect(spyAfterAllScenarios).not.toHaveBeenCalled()
                })
            })
        },
    )
})

describe(`Scenario steps are executed one after one`, () => {
    const feature = new Feature(`Handle scenario step one after one`)
    const scenario = new ScenarioType(`Step one after one`)

    scenario.steps.push(
        new Step(StepTypes.GIVEN, `I start a count to 0`),
        new Step(StepTypes.AND, `I increase the count by 1 in a promise`),
        new Step(StepTypes.WHEN, `I use a timeout`),
        new Step(StepTypes.THEN, `The count should be 2`),
    )
    feature.scenarii.push(scenario)

    describeFeature(feature, ({ Scenario }) => {
        Scenario(`Step one after one`, ({ Given, And, When, Then }) => {
            let count = 0
            Given(`I start a count to 0`, () => {
                expect(count).toBe(0)
            })
            And(`I increase the count by 1 in a promise`, async () => {
                await new Promise((resolve) => {
                    count++
                    resolve(null)
                })
            })
            When(`I use a timeout`, async () => {
                await new Promise((resolve) => {
                    setTimeout(() => {
                        count++
                        resolve(null)
                    }, 1000)
                })
            })
            Then(`The count should be 2`, () => {
                expect(count).toBe(2)
            })
        })
    })
})

describe(`teardowns to detect uncalled scenario and/or rule`, async () => {
    let featureTeardownSoy: MockInstance
    let ruleTeardownSpy: MockInstance
    let scenarioTeardownSpy: MockInstance

    beforeAll(() => {
        featureTeardownSoy = vi
            .spyOn(teardowns, `detectUnCalledScenarioAndRules`)
            .mockImplementation(() => { })
        ruleTeardownSpy = vi
            .spyOn(teardowns, `detectNotCalledRuleScenario`)
            .mockImplementation(() => { })
        scenarioTeardownSpy = vi
            .spyOn(teardowns, `detectUncalledScenarioStep`)
            .mockImplementation(() => { })
    })

    const gherkin = `
        Feature: detect uncalled rules
            Scenario: Simple scenario
                Given vitest-cucumber is running
                Then  check if I am called
            Rule: I am called
                Scenario: My parent rule is called
                    Given vitest-cucumber is running
                    Then  my parent rule is called

    `
    await fs.writeFile(`./rules.feature`, gherkin)

    const feature = await loadFeature(`./rules.feature`)

    afterAll(async () => {
        expect(featureTeardownSoy).toHaveBeenCalledWith(feature)
        expect(ruleTeardownSpy).toHaveBeenCalledWith(feature.rules[0])
        expect(scenarioTeardownSpy).toHaveBeenCalledWith(feature.rules[0].scenarii[0])
        expect(scenarioTeardownSpy).toHaveBeenCalledWith(feature.scenarii[0])

        await fs.unlink(`./rules.feature`)
    })

    describeFeature(feature, ({ Rule, Scenario }) => {
        Scenario(`Simple scenario`, ({ Given, Then }) => {
            Given(`vitest-cucumber is running`, () => { })
            Then(`check if I am called`, () => { })
        })
        Rule(`I am called`, ({ RuleScenario }) => {
            RuleScenario(`My parent rule is called`, ({ Given, Then }) => {
                Given(`vitest-cucumber is running`, () => { })
                Then(`my parent rule is called`, () => { })
            })
        })
    })
})

describe(`Ignore scenario with a tag`, async () => {
    const gherkin = `
        Feature: detect uncalled rules
            @awesome
            Scenario: Simple scenario
                Given vitest-cucumber is running
                Then  check if I am called
            @normal
            Scenario: My parent rule is called
                Given vitest-cucumber is running
                Then  my parent rule is called

    `
    await fs.writeFile(`./rules.feature`, gherkin)

    const feature = await loadFeature(`./rules.feature`)
    let calledScenarioCount = 0

    describeFeature(feature, ({ Scenario, BeforeEachScenario, AfterAllScenarios }) => {
        BeforeEachScenario(() => {
            calledScenarioCount++
        })
        AfterAllScenarios(() => {
            expect(calledScenarioCount).toEqual(1)
        })
        Scenario(`My parent rule is called`, ({ Given, Then }) => {
            Given(`vitest-cucumber is running`, () => {
                expect(true).toBeTruthy()
            })
            Then(`my parent rule is called`, () => { })
        })
    }, { excludeTags : [`awesome`] })
})

describe(`Ignore rule with a tag`, async () => {
    const gherkin = `
        Feature: detect uncalled rules
            @awesome
            Scenario: Simple scenario
                Given vitest-cucumber is running
                Then  check if I am called
            @normal
            Rule: ignored rule
                Scenario: My parent rule is called
                    Given vitest-cucumber is running
                    Then  my parent rule is called

    `
    await fs.writeFile(`./rules.feature`, gherkin)

    const feature = await loadFeature(`./rules.feature`)
    let calledScenarioCount = 0

    describeFeature(feature, ({ Scenario, BeforeEachScenario, AfterAllScenarios }) => {
        BeforeEachScenario(() => {
            calledScenarioCount++
        })
        AfterAllScenarios(() => {
            expect(calledScenarioCount).toEqual(1)
        })
        Scenario(`Simple scenario`, ({ Given, Then }) => {
            Given(`vitest-cucumber is running`, () => {
                expect(true).toBeTruthy()
            })
            Then(`check if I am called`, () => { })
        })
    }, { excludeTags : [`normal`] })
})

describe(`Ignore scenario in rule with a tag`, async () => {
    const gherkin = `
        Feature: detect uncalled rules
            @awesome
            Scenario: Me I am executed
                Given vitest-cucumber is running
                Then I am executed
            Rule: rule with ignored scenario
                @awesome
                Scenario: I am also executed
                    Given vitest-cucumber is running
                    Then  my parent rule is called
                @ignored
                Scenario: Simple scenario
                    Given vitest-cucumber is running
                    Then  I am ignored

    `
    await fs.writeFile(`./rules.feature`, gherkin)

    const feature = await loadFeature(`./rules.feature`)
    let calledScenarioCount = 0

    describeFeature(feature, ({ Scenario, Rule, BeforeEachScenario, AfterAllScenarios }) => {
        BeforeEachScenario(() => {
            calledScenarioCount++
        })
        AfterAllScenarios(() => {
            expect(calledScenarioCount).toEqual(2)
        })
        Scenario(`Me I am executed`, ({ Given, Then }) => {
            Given(`vitest-cucumber is running`, () => { })
            Then(`I am executed`, () => { })
        })
        Rule(`rule with ignored scenario`, ({ RuleScenario }) => {
            RuleScenario(`I am also executed`, ({ Given, Then }) => {
                Given(`vitest-cucumber is running`, () => {
                    expect(true).toBeTruthy()
                })
                Then(`my parent rule is called`, () => { })
            })
        })
    }, { excludeTags : [`ignored`] })
})