import { Feature } from "../../parser/feature"
import { ScenarioOutline as ScenarioOutlineType, Scenario as ScenarioType } from "../../parser/scenario"
import { Step, StepTypes } from "../../parser/step"
import { describeFeature } from '../describe-feature'
import {
    BackgroundNotExistsError,
    FeatureUknowScenarioError,
    IsScenarioOutlineError, NotScenarioOutlineError, UnknowStepError,
} from "../../errors/errors"
import fs from 'fs/promises'
import { loadFeature } from '../load-feature'
import * as teardowns from "../describe/teardowns"
import {
    MockInstance, afterAll, beforeAll, describe, expect, test, vi, 
} from "vitest"

describe(`Scenario with bad type`, () => {
    const feature = new Feature(`Detect wrong scenario type`)
    const scenarioOutline = new ScenarioOutlineType(`I'm an outline scenario`)
    const scenario = new ScenarioType(`I'm a scenario`)

    scenarioOutline.addStep(new Step(StepTypes.GIVEN, `A simple step`))
    scenario.addStep(new Step(StepTypes.GIVEN, `A simple step`))

    feature.addScenario(scenarioOutline)
    feature.addScenario(scenario)

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

    scenario.addStep(new Step(StepTypes.WHEN, `Simple when`))
    featire.addScenario(scenario)

    describeFeature(featire, ({ Scenario }) => {
        Scenario(scenario.description, ({ When, But }) => {
            try {
                When(`Simple when`, () => { })
                But(`I use bad step`, () => { })
            } catch (e) {
                test(`[checkIfScenarioExists] handle step not in scenario`, () => {
                    expect(e).toEqual(
                        new UnknowStepError(
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

    scenario.addStep(new Step(StepTypes.GIVEN, `Hooks are async`))
    scenario.addStep(new Step(StepTypes.THEN, `I wait hooks are finished`))

    feature.addScenario(scenario)

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

    first.addStep(new Step(StepTypes.THEN, `BeforeEachScenario should be called`))
    first.addStep(new Step(StepTypes.AND, `BeforeAllScenarios should be called`))
    first.addStep(new Step(StepTypes.BUT, `AfterEachScenario should not be called`))
    first.addStep(new Step(StepTypes.AND, `AfterAllScenarios should not be called`))

    second.addStep(new Step(StepTypes.THEN, `AfterEachScenario should be called`))
    second.addStep(new Step(StepTypes.AND, `AfterAllScenarios should not  be called`))

    feature.addScenario(first)
    feature.addScenario(second)

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

    scenario.addStep(new Step(StepTypes.GIVEN, `I start a count to 0`))
    scenario.addStep(new Step(StepTypes.AND, `I increase the count by 1 in a promise`))
    scenario.addStep(new Step(StepTypes.WHEN, `I use a timeout`))
    scenario.addStep(new Step(StepTypes.THEN, `The count should be 2`))

    feature.addScenario(scenario)

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

    beforeAll(() => {
        featureTeardownSoy = vi
            .spyOn(teardowns, `detectUnCalledScenarioAndRules`)
            .mockImplementation(() => { })
        ruleTeardownSpy = vi
            .spyOn(teardowns, `detectNotCalledRuleScenario`)
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
    await fs.writeFile(`${__dirname}/rules.feature`, gherkin)

    const feature = await loadFeature(`./rules.feature`)

    afterAll(async () => {
        expect(featureTeardownSoy).toHaveBeenCalledWith(feature, [])
        expect(ruleTeardownSpy).toHaveBeenCalledWith(feature.rules[0], [])

        await fs.unlink(`${__dirname}/rules.feature`)
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

describe(`Background run before scenario`, async () => {
    const gherkin = `
        Feature: Background run before scenario tests
            Background:
                Given I'm a background
            Scenario: Simple scenario
                Given I'm a scenario
                Then  background is run before me
            Rule: background in rule
                Background:
                    Given I'm a background in a rule
                Scenario: Simple rule scenario
                    Given I'm a rule scenario
                    Then  rule background is run before me
                    And   feature background is run before me

    `
    await fs.writeFile(`${__dirname}/background.feature`, gherkin)

    const feature = await loadFeature(`./background.feature`)

    describeFeature(feature, ({ Background, Scenario, Rule }) => {
        let featureBackgroundSpy = -1

        Background(({ Given }) => {
            Given(`I'm a background`,  async () => {
                console.debug(`Feature Background`)
                featureBackgroundSpy = 0
            })
        })

        Scenario(`Simple scenario`, ({ Given, Then }) => {
            Given(`I'm a scenario`, () => {
                console.debug(`Feature Scenario`)

                expect(featureBackgroundSpy).toEqual(0)
                featureBackgroundSpy += 1
            })
            Then(`background is run before me`, () => {
                expect(featureBackgroundSpy).toEqual(1)
            })
        })

        Rule(`background in rule`, ({ RuleBackground, RuleScenario }) => {
            let ruleBackgroundSpy = -1

            RuleBackground( ({ Given }) => {
                Given(`I'm a background in a rule`, () => {
                    console.debug(`Rule Background`)

                    ruleBackgroundSpy = 0
                })
            })
            RuleScenario(`Simple rule scenario`, ({ Given, Then, And }) => {
                Given(`I'm a rule scenario`, () => {
                    console.debug(`Rule Scenario`)
                    expect(ruleBackgroundSpy).toEqual(0)
                    ruleBackgroundSpy += 1
                })
                Then(`rule background is run before me`, () => {
                    expect(ruleBackgroundSpy).toEqual(1)
                })
                And(`feature background is run before me`, () => {
                    expect(ruleBackgroundSpy).toEqual(1)
                    expect(featureBackgroundSpy).toEqual(0)
                })
            })
        })
    })

    afterAll(async () => {
        await fs.unlink(`${__dirname}/background.feature`)
    })
})

describe(`Detect if feature contains background`, async () => {
    const gherkin = `
        Feature: Without background
            Scenario: Simple scenario
                Given I'm a scenario
                Then  background is run before me
    `
    await fs.writeFile(`${__dirname}/no-background.feature`, gherkin)

    const feature = await loadFeature(`./no-background.feature`)

    describeFeature(feature, ({ Background, Scenario }) => {
        expect(() => {
            Background(({ Given }) => {
                Given(`I'm a background`,  () => {})
            })
        }).toThrowError(
            new BackgroundNotExistsError(feature),
        )

        Scenario(`Simple scenario`, ({ Given, Then }) => {
            Given(`I'm a scenario`, () => {})
            Then(`background is run before me`, () => {})
        })
    })

    afterAll(async () => {
        await fs.unlink(`${__dirname}/no-background.feature`)
    })
})

describe(`Detect if rule contains background`, async () => {
    const gherkin = `
        Feature: Without background
            Rule: example rule
                Scenario: Simple scenario
                    Given I'm a scenario
                    Then  background is run before me
    `
    await fs.writeFile(`${__dirname}/rule-no-background.feature`, gherkin)

    const feature = await loadFeature(`./rule-no-background.feature`)

    describeFeature(feature, ({ Rule }) => {
        Rule(`example rule`, ({ RuleBackground, RuleScenario }) => {
            expect(() => {
                RuleBackground(({ Given }) => {
                    Given(`I'm a background`,  () => {})
                })
            }).toThrowError(
                new BackgroundNotExistsError(feature.rules[0]),
            )
    
            RuleScenario(`Simple scenario`, ({ Given, Then }) => {
                Given(`I'm a scenario`, () => {})
                Then(`background is run before me`, () => {})
            })
        })
    })

    afterAll(async () => {
        await fs.unlink(`${__dirname}/rule-no-background.feature`)
    })
})