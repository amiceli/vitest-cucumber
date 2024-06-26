import { Step, StepTypes } from "../../parser/step"
import { describeFeature } from '../describe-feature'
import {
    BackgroundNotCalledError,
    BackgroundNotExistsError,
    FeatureUknowRuleError, IsScenarioOutlineError, NotScenarioOutlineError, RuleNotCalledError, ScenarioNotCalledError, StepAbleStepsNotCalledError, StepAbleUnknowStepError,
} from "../../errors/errors"
// import * as teardowns from "../describe/teardowns"
import {
    afterAll, describe, expect,
    vi,
} from "vitest"
import { FeatureContentReader } from "../../__mocks__/FeatureContentReader.spec"
import { Rule } from "../../parser/Rule"

describe(`Feature`, () => {
    describe(`should detect uncalled Rule`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Rule: simple rule`,
            `      Scenario: Simple scenario`,
            `          Given vitest-cucumber is running`,
            `          Then  check if I am called`,
        ]).parseContent()
    
        afterAll(() => {
            expect(
                feature.rules[0].isCalled,
            ).toBe(false)
        })
    
        expect(() => {
            describeFeature(feature, () => { })
        }).toThrowError(
            new RuleNotCalledError(feature.rules[0]),
        )
    })
    describe(`should detect if rule exists`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Rule: simple rule`,
            `      Scenario: Simple scenario`,
            `          Given vitest-cucumber is running`,
            `          Then  check if I am called`,
        ]).parseContent()
    
        expect(() => {
            describeFeature(feature, (f) => {
                f.Rule(`another`, () => {})
            })
        }).toThrowError(
            new FeatureUknowRuleError(
                feature,
                new Rule(`another`),
            ),
        )
        
    })
    describe(`Should detect uncalled Background`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Background:`,
            `       Given vitest-cucumber is running`,
        ]).parseContent()
    
        afterAll(() => {
            expect(
                feature.background?.isCalled,
            ).toBe(false)
        })
    
        expect(() => {
            describeFeature(feature, () => { })
        }).toThrowError(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            new BackgroundNotCalledError(feature.background!),
        )
    })
    describe(`should detect uncalled Scenario`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario: Simple scenario`,
            `       Given vitest-cucumber is running`,
            `       Then  check if I am called`,
        ]).parseContent()
    
        afterAll(() => {
            expect(
                feature.scenarii[0].isCalled,
            ).toBe(false)
        })
    
        expect(() => {
            describeFeature(feature, () => { })
        }).toThrowError(
            new ScenarioNotCalledError(feature.scenarii[0]),
        )
    })
    describe(`should detect uncalled ScenarioOutline`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario Outline: Simple scenario`,
            `       Given vitest-cucumber is <state>`,
            `       Then  check if I am called`,
            `       Examples:`,
            `           | state    |`,
            `           | running  |`,
            `           | finished |`,
            ``,
        ]).parseContent()
    
        afterAll(() => {
            expect(
                feature.scenarii[0].isCalled,
            ).toBe(false)
        })
    
        expect(() => {
            describeFeature(feature, () => { })
        }).toThrowError(
            new ScenarioNotCalledError(feature.scenarii[0]),
        )
    })
    describe(`should detect if background exists`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario: Simple scenario`,
            `       Given vitest-cucumber is running`,
            `       Then  check if I am called`,
        ]).parseContent()

        expect(() => {
            describeFeature(feature, (f) => { 
                f.Background(() => {})
            })
        }).toThrowError(
            new BackgroundNotExistsError(feature),
        )
    })
    describe(`should detetc if Scenario is Outline`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario Outline: Simple scenario`,
            `       Given vitest-cucumber is <state>`,
            `       Then  check if I am called`,
            `       Examples:`,
            `           | state    |`,
            `           | running  |`,
            `           | finished |`,
            ``,
        ]).parseContent()
        
        expect(() => {
            describeFeature(feature, (f) => {
                f.Scenario(`Simple scenario`, () => {})
            })
        }).toThrowError(
            new IsScenarioOutlineError(feature.scenarii[0]),
        )
    })
    describe(`should detetc if Scenario isn't Outline`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario: Simple scenario`,
            `       Given vitest-cucumber is <state>`,
            `       Then  check if I am called`,
            ``,
        ]).parseContent()
        
        expect(() => {
            describeFeature(feature, (f) => {
                f.ScenarioOutline(`Simple scenario`, () => {})
            })
        }).toThrowError(
            new NotScenarioOutlineError(feature.scenarii[0]),
        )
    })
})

describe(`Rule`, () => {
    describe(`Should detect uncalled Background`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Rule: simple rule`,
            `      Background:`,
            `          Given vitest-cucumber is running`,
        ]).parseContent()
    
        afterAll(() => {
            expect(
                feature.rules[0].background?.isCalled,
            ).toBe(false)
        })

        describeFeature(feature, (f) => { 
            expect(() => {
                f.Rule(`simple rule`, () => {})
            }).toThrowError(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                new BackgroundNotCalledError(feature.rules[0].background!),
            )
        })
    })
    describe(`Should detect uncalled Scenario`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Rule: simple rule`,
            `      Scenario: test`,
            `          Given vitest-cucumber is running`,
        ]).parseContent()
    
        afterAll(() => {
            expect(
                feature.rules[0].scenarii[0].isCalled,
            ).toBe(false)
        })

        describeFeature(feature, (f) => { 
            expect(() => {
                f.Rule(`simple rule`, () => {})
            }).toThrowError(
                new ScenarioNotCalledError(feature.rules[0].scenarii[0]),
            )
        })
    })
    describe(`should detect uncalled ScenarioOutline`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Rule: simple rule`,
            `      Scenario Outline: Simple scenario`,
            `          Given vitest-cucumber is <state>`,
            `          Then  check if I am called`,
            `          Examples:`,
            `              | state    |`,
            `              | running  |`,
            `              | finished |`,
            ``,
        ]).parseContent()
    
        afterAll(() => {
            expect(
                feature.rules[0].scenarii[0].isCalled,
            ).toBe(false)
        })
    
        describeFeature(feature, (f) => { 
            expect(() => {
                f.Rule(`simple rule`, () => {})
            }).toThrowError(
                new ScenarioNotCalledError(feature.rules[0].scenarii[0]),
            )
        })
    })
    describe(`should detect if background exists`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Rule: simple rule`,
            `      Scenario: Simple scenario`,
            `          Given vitest-cucumber is running`,
            `          Then  check if I am called`,
        ]).parseContent()

        expect(() => {
            describeFeature(feature, (f) => { 
                f.Rule(`simple rule`, (r) => {
                    r.RuleBackground(() => {})
                })
            })
        }).toThrowError(
            new BackgroundNotExistsError(feature.rules[0]),
        )
    })
    describe(`should detetc if Scenario is Outline`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Rule: simple rule`,
            `      Scenario Outline: Simple scenario`,
            `          Given vitest-cucumber is <state>`,
            `          Then  check if I am called`,
            `          Examples:`,
            `              | state    |`,
            `              | running  |`,
            `              | finished |`,
            ``,
        ]).parseContent()
        
        expect(() => {
            describeFeature(feature, (f) => {
                f.Rule(`simple rule`, (r) => {
                    r.RuleScenario(`Simple scenario`, () => {})
                })
            })
        }).toThrowError(
            new IsScenarioOutlineError(feature.rules[0].scenarii[0]),
        )
    })
    describe(`should detetc if Scenario isn't Outline`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Rule: simple rule`,
            `      Scenario: Simple scenario`,
            `          Given vitest-cucumber is <state>`,
            `          Then  check if I am called`,
            ``,
        ]).parseContent()
        
        expect(() => {
            describeFeature(feature, (f) => {
                f.Rule(`simple rule`, (r) => {
                    r.RuleScenarioOutline(`Simple scenario`, () => {})
                })
            })
        }).toThrowError(
            new NotScenarioOutlineError(feature.rules[0].scenarii[0]),
        )
    })
})

describe(`Scenario`, () => {
    describe(`should detect uncalled Scenario step`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario: Simple scenario`,
            `       Given vitest-cucumber is running`,
            `       Then  check if I am called`,
        ]).parseContent()
    
        const testShouldNotStart = vi.fn()
    
        afterAll(() => {
            expect(
                feature.scenarii[0].isCalled,
            ).toBe(true)
            expect(
                feature.scenarii[0].steps[0].isCalled,
            ).toBe(true)
            expect(
                feature.scenarii[0].steps[1].isCalled,
            ).toBe(false)
            expect(testShouldNotStart).not.toHaveBeenCalled()
        })
    
        describeFeature(feature, (f) => {
            expect(() => {
                f.Scenario(`Simple scenario`, (s) => {
                    s.Given(`vitest-cucumber is running`, () => {
                        testShouldNotStart()
                    })
                })
            }).toThrowError(
                new StepAbleStepsNotCalledError(
                    feature.scenarii[0],
                    feature.scenarii[0].steps[1],
                ),
            )
        })
    })
    describe(`should detect if step exists`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario: Simple scenario`,
            `       Given vitest-cucumber is running`,
            `       Then  check if I am called`,
        ]).parseContent()

        describeFeature(feature, (f) => {
            expect(() => {
                f.Scenario(`Simple scenario`, (s) => {
                    s.Given(`kaamelott`, () => {})
                })
            }).toThrowError(
                new StepAbleUnknowStepError(
                    feature.scenarii[0],
                    new Step(StepTypes.GIVEN, `kaamelott`),
                ),
            )
        })
    })
})

describe(`Background`, () => {
    describe(`should detect uncalled Background step`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Background:`,
            `       Given vitest-cucumber is running`,
        ]).parseContent()
    
        afterAll(() => {
            expect(
                feature.background?.steps[0].isCalled,
            ).toBe(false)
        })
    
        describeFeature(feature, (f) => {
            expect(() => {
                f.Background(() => {})
            }).toThrowError(
                new StepAbleStepsNotCalledError(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    feature.background!,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    feature.background!.steps[0],
                ),
            )
        })
    })
    describe(`should detect if step exists`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Background:`,
            `       Given vitest-cucumber is running`,
        ]).parseContent()

        describeFeature(feature, (f) => {
            expect(() => {
                f.Background((s) => {
                    s.Given(`kaamelott`, () => {})
                })
            }).toThrowError(
                new StepAbleUnknowStepError(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    feature.background!,
                    new Step(StepTypes.GIVEN, `kaamelott`),
                ),
            )
        })
    })
})

describe(`ScenarioOutline`, () => {
    describe(`should detect uncalled Scenario step`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario Outline: Simple scenario`,
            `       Given vitest-cucumber is <state>`,
            `       Then  check if I am called`,
            `       Examples:`,
            `           | state    |`,
            `           | running  |`,
            `           | finished |`,
            ``,
        ]).parseContent()
    
        afterAll(() => {
            expect(
                feature.scenarii[0].isCalled,
            ).toBe(true)
            expect(
                feature.scenarii[0].steps[0].isCalled,
            ).toBe(false)
        })
    
        describeFeature(feature, (f) => {
            expect(() => {
                f.ScenarioOutline(`Simple scenario`, () => {})
            }).toThrowError(
                new StepAbleStepsNotCalledError(
                    feature.scenarii[0],
                    feature.scenarii[0].steps[0],
                ),
            )
        })
    })
    describe(`should detect if step exists`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario Outline: Simple scenario`,
            `       Given vitest-cucumber is <state>`,
            `       Then  check if I am called`,
            `       Examples:`,
            `           | state    |`,
            `           | running  |`,
            `           | finished |`,
            ``,
        ]).parseContent()

        describeFeature(feature, (f) => {
            expect(() => {
                f.ScenarioOutline(`Simple scenario`, (s) => {
                    s.Given(`kaamelott`, () => {})
                })
            }).toThrowError(
                new StepAbleUnknowStepError(
                    feature.scenarii[0],
                    new Step(StepTypes.GIVEN, `kaamelott`),
                ),
            )
        })
    })
})

// describe(`Async scenario hooks`, () => {
//     const feature = new Feature(`Async scenario hook`)
//     const scenario = new ScenarioType(`A simple Scenario`)

//     scenario.steps.push(
//         new Step(StepTypes.GIVEN, `Hooks are async`),
//         new Step(StepTypes.THEN, `I wait hooks are finished`),
//     )

//     feature.scenarii.push(scenario)

//     type ResolveArgs = (
//         resolve: (value: void | PromiseLike<void>) => void
//     ) => void

//     function delayPromise (fn: ResolveArgs): Promise<void> {
//         return new Promise((resolve) => {
//             setTimeout(() => { fn(resolve) }, 400)
//         })
//     }

//     let beforeEachScenarioHookFinished = false
//     let beforeAllScenarioHookFinished = false
//     let afterEachScenarioHookFinished = false
//     let afterAllScenarioHookFinished = true

//     afterAll(() => {
//         expect(afterAllScenarioHookFinished).toBeTruthy()
//     })

//     describeFeature(feature, ({ BeforeEachScenario, AfterEachScenario, BeforeAllScenarios, AfterAllScenarios, Scenario }) => {
//         BeforeAllScenarios(async () => {
//             await delayPromise((resolve) => {
//                 beforeAllScenarioHookFinished = true
//                 resolve()
//             })
//         })
//         BeforeEachScenario(async () => {
//             expect(beforeAllScenarioHookFinished).toBe(true)

//             await delayPromise((resolve) => {
//                 beforeEachScenarioHookFinished = true
//                 resolve()
//             })
//         })
//         AfterEachScenario(async () => {
//             expect(beforeEachScenarioHookFinished).toBe(true)
//             expect(beforeAllScenarioHookFinished).toBe(true)

//             await delayPromise((resolve) => {
//                 afterEachScenarioHookFinished = true
//                 resolve()
//             })
//         })
//         AfterAllScenarios(async () => {
//             await delayPromise((resolve) => {
//                 expect(beforeEachScenarioHookFinished).toBe(true)
//                 expect(beforeAllScenarioHookFinished).toBe(true)
//                 expect(afterEachScenarioHookFinished).toBe(true)

//                 afterAllScenarioHookFinished = true
//                 resolve()
//             })
//         })
//         Scenario(`A simple Scenario`, ({ Given, Then }) => {
//             Given(`Hooks are async`, () => {
//                 expect(beforeEachScenarioHookFinished).toBeTruthy()
//             })
//             Then(`I wait hooks are finished`, () => {
//                 expect(beforeAllScenarioHookFinished).toBeTruthy()
//             })
//         })
//     })
// })

// describe(`Scneario hooks`, () => {
//     const feature = new Feature(`Check scenario hooks`)
//     const first = new ScenarioType(`First scenario`)
//     const second = new ScenarioType(`Second scenario`)

//     first.steps.push(
//         new Step(StepTypes.THEN, `BeforeEachScenario should be called`),
//         new Step(StepTypes.AND, `BeforeAllScenarios should be called`),
//         new Step(StepTypes.BUT, `AfterEachScenario should not be called`),
//         new Step(StepTypes.AND, `AfterAllScenarios should not be called`),
//     )
//     second.steps.push(
//         new Step(StepTypes.THEN, `AfterEachScenario should be called`),
//         new Step(StepTypes.AND, `AfterAllScenarios should not  be called`),
//     )
//     feature.scenarii.push(first, second)

//     const spyBeforeEachScenario = vi.fn()
//     const spyBeforeAllScenarios = vi.fn()
//     const spyAfterEachScenario = vi.fn()
//     const spyAfterAllScenarios = vi.fn()

//     afterAll(() => {
//         expect(spyAfterAllScenarios).toHaveBeenCalled()
//     })

//     describeFeature(
//         feature,
//         ({ Scenario, BeforeEachScenario, AfterEachScenario, AfterAllScenarios, BeforeAllScenarios }) => {
//             BeforeEachScenario(() => { spyBeforeEachScenario() })
//             BeforeAllScenarios(() => { spyBeforeAllScenarios() })
//             AfterEachScenario(() => { spyAfterEachScenario() })
//             AfterAllScenarios(() => { spyAfterAllScenarios() })

//             Scenario(`First scenario`, ({ Then, And, But }) => {
//                 Then(`BeforeEachScenario should be called`, () => {
//                     expect(spyBeforeEachScenario).toHaveBeenCalled()
//                 })
//                 And(`BeforeAllScenarios should be called`, () => {
//                     expect(spyBeforeAllScenarios).toHaveBeenCalled()
//                 })
//                 But(`AfterEachScenario should not be called`, () => {
//                     expect(spyAfterEachScenario).not.toHaveBeenCalled()
//                 })
//                 And(`AfterAllScenarios should not be called`, () => {
//                     expect(spyAfterAllScenarios).not.toHaveBeenCalled()
//                 })
//             })

//             Scenario(`Second scenario`, ({ Then, And }) => {
//                 Then(`AfterEachScenario should be called`, () => {
//                     expect(spyAfterEachScenario).toHaveBeenCalled()
//                 })
//                 And(`AfterAllScenarios should not  be called`, () => {
//                     expect(spyAfterAllScenarios).not.toHaveBeenCalled()
//                 })
//             })
//         },
//     )
// })

// describe(`Scenario steps are executed one after one`, () => {
//     const feature = new Feature(`Handle scenario step one after one`)
//     const scenario = new ScenarioType(`Step one after one`)

//     scenario.steps.push(
//         new Step(StepTypes.GIVEN, `I start a count to 0`),
//         new Step(StepTypes.AND, `I increase the count by 1 in a promise`),
//         new Step(StepTypes.WHEN, `I use a timeout`),
//         new Step(StepTypes.THEN, `The count should be 2`),
//     )
//     feature.scenarii.push(scenario)

//     describeFeature(feature, ({ Scenario }) => {
//         Scenario(`Step one after one`, ({ Given, And, When, Then }) => {
//             let count = 0
//             Given(`I start a count to 0`, () => {
//                 expect(count).toBe(0)
//             })
//             And(`I increase the count by 1 in a promise`, async () => {
//                 await new Promise((resolve) => {
//                     count++
//                     resolve(null)
//                 })
//             })
//             When(`I use a timeout`, async () => {
//                 await new Promise((resolve) => {
//                     setTimeout(() => {
//                         count++
//                         resolve(null)
//                     }, 1000)
//                 })
//             })
//             Then(`The count should be 2`, () => {
//                 expect(count).toBe(2)
//             })
//         })
//     })
// })

// describe(`Background run before scenario`, async () => {
//     const gherkin = `
//         Feature: Background run before scenario tests
//             Background:
//                 Given I'm a background
//             Scenario: Simple scenario
//                 Given I'm a scenario
//                 Then  background is run before me
//             Rule: background in rule
//                 Background:
//                     Given I'm a background in a rule
//                 Scenario: Simple rule scenario
//                     Given I'm a rule scenario
//                     Then  rule background is run before me
//                     And   feature background is run before me

//     `
//     await fs.writeFile(`${__dirname}/background.feature`, gherkin)

//     const feature = await loadFeature(`./background.feature`)

//     describeFeature(feature, ({ Background, Scenario, Rule }) => {
//         let featureBackgroundSpy = -1

//         Background(({ Given }) => {
//             Given(`I'm a background`,  async () => {
//                 console.debug(`Feature Background`)
//                 featureBackgroundSpy = 0
//             })
//         })

//         Scenario(`Simple scenario`, ({ Given, Then }) => {
//             Given(`I'm a scenario`, () => {
//                 console.debug(`Feature Scenario`)

//                 expect(featureBackgroundSpy).toEqual(0)
//                 featureBackgroundSpy += 1
//             })
//             Then(`background is run before me`, () => {
//                 expect(featureBackgroundSpy).toEqual(1)
//             })
//         })

//         Rule(`background in rule`, ({ RuleBackground, RuleScenario }) => {
//             let ruleBackgroundSpy = -1

//             RuleBackground( ({ Given }) => {
//                 Given(`I'm a background in a rule`, () => {
//                     console.debug(`Rule Background`)

//                     ruleBackgroundSpy = 0
//                 })
//             })
//             RuleScenario(`Simple rule scenario`, ({ Given, Then, And }) => {
//                 Given(`I'm a rule scenario`, () => {
//                     console.debug(`Rule Scenario`)
//                     expect(ruleBackgroundSpy).toEqual(0)
//                     ruleBackgroundSpy += 1
//                 })
//                 Then(`rule background is run before me`, () => {
//                     expect(ruleBackgroundSpy).toEqual(1)
//                 })
//                 And(`feature background is run before me`, () => {
//                     expect(ruleBackgroundSpy).toEqual(1)
//                     expect(featureBackgroundSpy).toEqual(0)
//                 })
//             })
//         })
//     })

//     afterAll(async () => {
//         await fs.unlink(`${__dirname}/background.feature`)
//     })
// })

// describe(`Detect if feature contains background`, async () => {
//     const gherkin = `
//         Feature: Without background
//             Scenario: Simple scenario
//                 Given I'm a scenario
//                 Then  background is run before me
//     `
//     await fs.writeFile(`${__dirname}/no-background.feature`, gherkin)

//     const feature = await loadFeature(`./no-background.feature`)

//     describeFeature(feature, ({ Background, Scenario }) => {
//         expect(() => {
//             Background(({ Given }) => {
//                 Given(`I'm a background`,  () => {})
//             })
//         }).toThrowError(
//             new BackgroundNotExistsError(feature),
//         )

//         Scenario(`Simple scenario`, ({ Given, Then }) => {
//             Given(`I'm a scenario`, () => {})
//             Then(`background is run before me`, () => {})
//         })
//     })

//     afterAll(async () => {
//         await fs.unlink(`${__dirname}/no-background.feature`)
//     })
// })

// describe(`Detect if rule contains background`, async () => {
//     const gherkin = `
//         Feature: Without background
//             Rule: example rule
//                 Scenario: Simple scenario
//                     Given I'm a scenario
//                     Then  background is run before me
//     `
//     await fs.writeFile(`${__dirname}/rule-no-background.feature`, gherkin)

//     const feature = await loadFeature(`./rule-no-background.feature`)

//     describeFeature(feature, ({ Rule }) => {
//         Rule(`example rule`, ({ RuleBackground, RuleScenario }) => {
//             expect(() => {
//                 RuleBackground(({ Given }) => {
//                     Given(`I'm a background`,  () => {})
//                 })
//             }).toThrowError(
//                 new BackgroundNotExistsError(feature.rules[0]),
//             )
    
//             RuleScenario(`Simple scenario`, ({ Given, Then }) => {
//                 Given(`I'm a scenario`, () => {})
//                 Then(`background is run before me`, () => {})
//             })
//         })
//     })

//     afterAll(async () => {
//         await fs.unlink(`${__dirname}/rule-no-background.feature`)
//     })
// })