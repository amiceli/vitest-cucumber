import {
    MockInstance, expect, vi, test,
} from "vitest"
import { Feature } from "../../parser/feature"
import { ScenarioOutline as ScenarioOutlineType, Scenario as ScenarioType } from "../../parser/scenario"
import { Step, StepTypes } from "../../parser/step"
import { FeatureStateDetector, ScenarioStateDetector } from "../feature-state"
import { describeFeature } from '../describe-feature'
import {
    FeatureUknowScenarioError,
    IsScenarioOutlineError,
    MissingScenarioOutlineVariableValueError,
    NotScenarioOutlineError,
    ScenarioNotCalledError, 
    ScenarioOulineWithoutExamplesError, 
    ScenarioOutlineVariableNotCalledInStepsError, 
    ScenarioOutlineVariablesDeclaredWithoutExamplesError, 
    ScenarioStepsNotCalledError,
    ScenarioUnknowStepError,
} from "../../errors/errors"

(() => {
    const feature = new Feature(`Feature with a scenario`)
    const scenario = new ScenarioType(`This scenario will be called`)
    const step = new Step(StepTypes.GIVEN, `I have one step`)

    scenario.steps.push(step)
    feature.scenarii.push(scenario)

    describeFeature(feature, ({ Scenario }) => {
        Scenario(`This scenario will be called`, ({ Given }) => {
            Given(`I have one step`, () => {
                expect(true).toBe(true)
            })
        })
    
    })
})();

(() => {
    const currentFeature = new Feature(`Handle forgotten scenario`)
    const goodScenario = new ScenarioType(`Good Scenario`)
    const forgottenScenario = new ScenarioType(`Forgotten Scenario`)

    goodScenario.steps.push(new Step(StepTypes.GIVEN, `This scenario is called`))
    currentFeature.scenarii.push(goodScenario)
    currentFeature.scenarii.push(forgottenScenario)

    const detector = FeatureStateDetector.forFeature(currentFeature)
    let checkNotCalledScenario : MockInstance
    let expectThrownEroor : Error | null = null

    describeFeature(currentFeature, ({ BeforeAllScenarios, AfterAllScenarios, Scenario }) => {
    
        BeforeAllScenarios(()  => {
            vi.spyOn(FeatureStateDetector, `forFeature`).mockImplementation(() => {
                try {
                    detector.checkNotCalledScenario()
                } catch (e) {
                    expectThrownEroor = e
                }
                checkNotCalledScenario = vi
                    .spyOn(detector, `checkNotCalledScenario`)
                    .mockImplementation(() => { })
        
                return detector
            })
        })
    
        AfterAllScenarios(() => {
            expect(checkNotCalledScenario).toHaveBeenCalled()
            expect(expectThrownEroor).toEqual(
                new ScenarioNotCalledError(
                    forgottenScenario,
                ),
            )

            vi.restoreAllMocks()
        })
    
        Scenario(`Good Scenario`, ({ Given }) => {
            Given(`This scenario is called`, () => {})
        })
    })
})();

(() => {
    const currentFeature = new Feature(`Handle scenario step not called`)
    const scenario = new ScenarioType(`Step not called`)

    scenario.steps.push(new Step(StepTypes.GIVEN, `A simple step`))
    scenario.steps.push(new Step(StepTypes.AND, `Forgotten step`))
    currentFeature.scenarii.push(scenario)

    const detector = ScenarioStateDetector.forScenario(scenario)
    let checkIfStepWasCalled : MockInstance
    let expectThrownEroor : Error | null = null

    describeFeature(currentFeature, ({ BeforeAllScenarios, AfterAllScenarios, Scenario }) => {
    
        BeforeAllScenarios(()  => {
            vi.spyOn(ScenarioStateDetector, `forScenario`).mockImplementation(() => {
                try {
                    detector.checkIfStepWasCalled()
                } catch (e) {
                    expectThrownEroor = e
                }
                checkIfStepWasCalled = vi
                    .spyOn(detector, `checkIfStepWasCalled`)
                    .mockImplementation(() => { })
        
                return detector
            })
        })
    
        AfterAllScenarios(() => {
            expect(checkIfStepWasCalled).toHaveBeenCalled()
            expect(expectThrownEroor).toEqual(
                new ScenarioStepsNotCalledError(
                    scenario,
                ),
            )

            vi.restoreAllMocks()
        })
    
        Scenario(`Step not called`, ({ Given }) => {
            Given(`A simple step`, () => {})
        })
    })
})();

(() => {
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
            And(`I increase the count by 1 in a promise`, async  () => {
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
})();

(() => {
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

    describeFeature(
        feature, 
        ({ Scenario, BeforeEachScenario, AfterEachScenario, AfterAllScenarios, BeforeAllScenarios }) => {
            const spyBeforeEachScenario = vi.fn()
            const spyBeforeAllScenarios = vi.fn()
            const spyAfterEachScenario = vi.fn()
            const spyAfterAllScenarios = vi.fn()

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
})();

(() => {
    const feature = new Feature(`Detect wrong scenario type`)
    const scenarioOutline = new ScenarioOutlineType(`I'm an outline scenario`)
    const scenario = new ScenarioType(`I'm a scenario`)

    scenarioOutline.steps.push(new Step(StepTypes.GIVEN, `A simple step`))
    scenario.steps.push(new Step(StepTypes.GIVEN, `A simple step`))

    feature.scenarii.push(scenarioOutline, scenario)
    
    describeFeature(feature, ({ Scenario, ScenarioOutline }) => {
        try {
            Scenario(`I'm an outline scenario`, () => {} )
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
})();

(() => {
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
})();

(() => {
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
})();

(() => {
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
})();

(() => {
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
})();

(() => {
    const feature = new Feature(`Use ScenarioOutline without variable in Examples`)
    const scenario = new ScenarioOutlineType(`I forgot Examples variables name`)

    scenario.steps.push(
        new Step(StepTypes.GIVEN, `I love <height>`),
    )

    scenario.examples.push( { height : undefined } )

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
})();

(() => {
    const featire = new Feature(`Check if step exists [checkIfScenarioExists]`)
    const scenario = new ScenarioType(`Example `)

    scenario.steps.push(
        new Step(StepTypes.WHEN, `Simple when`),
    )
    featire.scenarii.push(scenario)

    describeFeature(featire, ({ Scenario }) => {
        Scenario(scenario.description, ({ When, But }) => {
            try {
                When(`Simple when`, () => {})
                But(`I use bad step`, () => {})
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
})();

(() => {
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
})()
