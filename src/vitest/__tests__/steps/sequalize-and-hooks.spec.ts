import { afterAll, describe, expect, vi } from 'vitest'
import { FeatureContentReader } from '../../../__mocks__/FeatureContentReader.spec'
import { describeFeature } from '../../describe-feature'

describe(`Async scenario hooks`, () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Async scenario hook`,
        `   Scenario: A simple Scenario`,
        `       Given Hooks are async`,
        `       Then  I wait hooks are finished`,
    ]).parseContent()

    type ResolveArgs = (
        resolve: (value: void | PromiseLike<void>) => void,
    ) => void

    function delayPromise(fn: ResolveArgs): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                fn(resolve)
            }, 200)
        })
    }

    let beforeEachScenarioHookFinished = false
    let beforeAllScenarioHookFinished = false
    let afterEachScenarioHookFinished = false
    let afterAllScenarioHookFinished = true

    afterAll(() => {
        expect(afterAllScenarioHookFinished).toBeTruthy()
    })

    describeFeature(feature, (f) => {
        f.BeforeAllScenarios(async () => {
            await delayPromise((resolve) => {
                beforeAllScenarioHookFinished = true
                resolve()
            })
        })
        f.BeforeEachScenario(async () => {
            expect(beforeAllScenarioHookFinished).toBe(true)

            await delayPromise((resolve) => {
                beforeEachScenarioHookFinished = true
                resolve()
            })
        })
        f.AfterEachScenario(async () => {
            expect(beforeEachScenarioHookFinished).toBe(true)
            expect(beforeAllScenarioHookFinished).toBe(true)

            await delayPromise((resolve) => {
                afterEachScenarioHookFinished = true
                resolve()
            })
        })
        f.AfterAllScenarios(async () => {
            await delayPromise((resolve) => {
                expect(beforeEachScenarioHookFinished).toBe(true)
                expect(beforeAllScenarioHookFinished).toBe(true)
                expect(afterEachScenarioHookFinished).toBe(true)

                afterAllScenarioHookFinished = true
                resolve()
            })
        })
        f.Scenario(`A simple Scenario`, ({ Given, Then }) => {
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
    const feature = FeatureContentReader.fromString([
        `Feature: Check scenario hooks`,
        `   Scenario: First scenario`,
        `       Given BeforeEachScenario should be called`,
        `       And   BeforeAllScenarios should be called`,
        `       But   AfterEachScenario should not be called`,
        `       And   AfterAllScenarios should not be called`,
        `   Scenario: Second scenario`,
        `       Given AfterEachScenario should be called`,
        `       And   AfterAllScenarios should not  be called`,
    ]).parseContent()

    const spyBeforeEachScenario = vi.fn()
    const spyBeforeAllScenarios = vi.fn()
    const spyAfterEachScenario = vi.fn()
    const spyAfterAllScenarios = vi.fn()

    afterAll(() => {
        expect(spyAfterAllScenarios).toHaveBeenCalled()
    })

    describeFeature(
        feature,
        ({
            Scenario,
            BeforeEachScenario,
            AfterEachScenario,
            AfterAllScenarios,
            BeforeAllScenarios,
        }) => {
            BeforeEachScenario(() => {
                spyBeforeEachScenario()
            })
            BeforeAllScenarios(() => {
                spyBeforeAllScenarios()
            })
            AfterEachScenario(() => {
                spyAfterEachScenario()
            })
            AfterAllScenarios(() => {
                spyAfterAllScenarios()
            })

            Scenario(`First scenario`, ({ Given, And, But }) => {
                Given(`BeforeEachScenario should be called`, () => {
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

            Scenario(`Second scenario`, ({ Given, And }) => {
                Given(`AfterEachScenario should be called`, () => {
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
    const feature = FeatureContentReader.fromString([
        `Feature: Handle scenario step one after one`,
        `   Scenario: Step one after one`,
        `       Given I start a count to 0`,
        `       And   I increase the count by 1 in a promise`,
        `       When  I use a timeout`,
        `       Then  The count should be 2`,
    ]).parseContent()

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
                expect(count).toBe(1)
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

describe(`Background run before scenario`, async () => {
    const feature = FeatureContentReader.fromString([
        `Feature: Background run before scenario tests`,
        `    Background:`,
        `        Given I'm a background`,
        `    Scenario: Simple scenario`,
        `        Given I'm a scenario`,
        `        Then  background is run before me`,
        `    Rule: background in rule`,
        `        Background:`,
        `            Given I'm a background in a rule`,
        `        Scenario: Simple rule scenario`,
        `            Given I'm a rule scenario`,
        `            Then  rule background is run before me`,
        `            And   feature background is run before me`,
    ]).parseContent()

    describeFeature(feature, ({ Background, Scenario, Rule }) => {
        let featureBackgroundSpy = -1

        Background(({ Given }) => {
            Given(`I'm a background`, async () => {
                featureBackgroundSpy = 0
            })
        })

        Scenario(`Simple scenario`, ({ Given, Then }) => {
            Given(`I'm a scenario`, () => {
                expect(featureBackgroundSpy).toEqual(0)
                featureBackgroundSpy += 1
            })
            Then(`background is run before me`, () => {
                expect(featureBackgroundSpy).toEqual(1)
            })
        })

        Rule(`background in rule`, ({ RuleBackground, RuleScenario }) => {
            let ruleBackgroundSpy = -1

            RuleBackground(({ Given }) => {
                Given(`I'm a background in a rule`, () => {
                    ruleBackgroundSpy = 0
                })
            })
            RuleScenario(`Simple rule scenario`, ({ Given, Then, And }) => {
                Given(`I'm a rule scenario`, () => {
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
})
