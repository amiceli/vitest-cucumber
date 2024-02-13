import { Feature } from "../../parser/feature"
import { ScenarioOutline as ScenarioOutlineType, Scenario as ScenarioType } from "../../parser/scenario"
import { Step, StepTypes } from "../../parser/step"
import { describeFeature } from '../describe-feature'
import {
    FeatureUknowScenarioError,
    IsScenarioOutlineError, NotScenarioOutlineError, ScenarioUnknowStepError,
} from "../../errors/errors"
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
        expect(featureTeardownSoy).toHaveBeenCalledWith(feature, [])
        expect(ruleTeardownSpy).toHaveBeenCalledWith(feature.rules[0], [])
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
