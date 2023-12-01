import { loadFeature, loadFeatures } from '../load-feature'
import { describeFeature } from '../describe-feature'
import {
    expect, vi, test, beforeEach,
} from 'vitest'

const feature = await loadFeature(`src/vitest/__tests__/index.feature`)

vi.mock(`vitest`, async () => {
    const mod = await vi.importActual<
    typeof import('vitest')
    >(`vitest`)

    return {
        ...mod,
        test : (s : string, fn : () => void) => {
            fn()
        },
        describe : (s: undefined, fn: () => void) => {
            fn()
            return {
                on : (title: string, f: () => void) => {
                    f()
                },
            }
        },
    }
})

beforeEach(() => {
    vi.clearAllMocks()
})

test(`Forgot a scenario`, () => {
    expect(
        () => describeFeature(feature, () => {
            // 
        }),
    ).toThrowError(`Scenario: Forgot a scenario was not called`)
})

test(`Bad scenario name`, () => {
    expect(
        () => describeFeature(feature, ({ Scenario }) => {
            
            Scenario(`Forgot a scenario`, ({ Given, When, Then }) => {
                Given(`Developer using vitest-cucumber`, () => { })
                When(`I forgot a scenario`, () => {})
                Then(`vitest-cucumber throw an error`, () => {})
            })

            Scenario(`wrong name`, () => {})
        }),
    ).toThrowError(`Scenario: wrong name doesn't exist in your Feature`)
})

test(`Bad step name`, () => {
    expect(
        () => describeFeature(feature, ({ Scenario }) => {
            
            Scenario(`Forgot a scenario`, ({ Given }) => {
                Given(`Developer using vitest-gherkin`, () => { })
            })

        }),
    ).toThrowError(`Given Developer using vitest-gherkin doesn't exist in your Scenario`)
})

test(`Scenario steps(s) validation`, () => {
    expect(
        () => describeFeature(feature, ({ Scenario }) => {
            
            Scenario(`Forgot a scenario`, ({ Given, When, Then }) => {
                Given(`Developer using vitest-cucumber`, () => { })
                When(`I forgot a scenario`, () => {})
                Then(`vitest-cucumber throw an error`, () => {})
            })

            Scenario(`Bad scenario name`, ({ Given, When, Then }) => {
                Given(`Developer using again vitest-cucumber`, () => { })
                When(`I type a wrong scenario name`, () => {})
                Then(`vitest-cucumber throw an error`, () => {})
            })

            Scenario(`Scenario steps(s) validation`, ({ Given, When, Then }) => {
                Given(`Developer one more time vitest-cucumber`, () => {})
                When(`I forgot a scenario step`, () => {})
                Then(`vitest-cucumber throw an error`, () => {})
            })
        }),

    ).toThrowError(`And I know which steps are missing was not called`)
})

test(`ScenarioOutline with missing variables in step`, async () => {
    const [
        missingExamples,
        missingVariablesInSteps,
        lastFeatureForVariablesValues,
    ] = await loadFeatures(`src/vitest/__tests__/scenario-outline.feature`)

    expect(
        () => describeFeature(missingExamples, ({ ScenarioOutline }) => {
            ScenarioOutline(`Scenario without examples`, ({ Given, And, Then }) => {
                Given(`I run this scenario outline`, () => {})
                And(`I forgot to add examples`, () => {})
                Then(`I have an error`, () => {})
            })
        }),
    ).toThrowError(`ScenarioOutline: Scenario without examples has no examples`)
    
    expect(
        () => describeFeature(missingVariablesInSteps, ({ ScenarioOutline }) => {
            ScenarioOutline(`Missing examples variables in steps`, ({ Given, And, Then }) => {
                Given(`I run this scenario outline`, () => {})
                And(`I add only <foo>`, () => {})
                Then(`I have an error`, () => {})
            })
        }),
    ).toThrowError(`ScenarioOutline: Missing examples variables in steps missing bar in step`)

    expect(
        () => describeFeature(lastFeatureForVariablesValues, ({ ScenarioOutline }) => {
            ScenarioOutline(`Missing value for variables in Examples`, ({ Given, And, Then, But }) => {
                Given(`I run this scenario outline`, () => {})
                And(`I add <foo>, <bar> variables`, () => {})
                But(`I forgot to set values`, () => {})
                Then(`I have an error`, () => {})
            })
        }),
    ).toThrowError(`ScenarioOutline: Missing value for variables in Examples missing foo value in Examples`)
})

test(`Check scenario type`, async () => {
    const [
        missingExamples,
    ] = await loadFeatures(`src/vitest/__tests__/scenario-outline.feature`)

    expect(
        () => describeFeature(missingExamples, ({ Scenario }) => {
            Scenario(`Scenario without examples`, ({ Given, And, Then } ) => {
                Given(`I run this scenario outline`, () => {})
                And(`I forgot to add examples`, () => {})
                Then(`I have an error`, () => {})
            })
        }),
    ).toThrowError(`Scenario without examples is an outlin`)

    expect(
        () => describeFeature(feature, ({ ScenarioOutline }) => {
            
            ScenarioOutline(`Forgot a scenario`, ({ Given, When, Then }) => {
                Given(`Developer using vitest-cucumber`, () => { })
                When(`I forgot a scenario`, () => {})
                Then(`vitest-cucumber throw an error`, () => {})
            })
        }),
    ).not.toThrowError(`Error: Forgot a scenario is not an outline`)
})

test(`Everything is ok`, () => {
    expect(
        () => describeFeature(feature, ({ Scenario, ScenarioOutline }) => {
            
            Scenario(`Forgot a scenario`, ({ Given, When, Then }) => {
                Given(`Developer using vitest-cucumber`, () => { })
                When(`I forgot a scenario`, () => {})
                Then(`vitest-cucumber throw an error`, () => {})
            })

            Scenario(`Bad scenario name`, ({ Given, When, Then }) => {
                Given(`Developer using again vitest-cucumber`, () => { })
                When(`I type a wrong scenario name`, () => {})
                Then(`vitest-cucumber throw an error`, () => {})
            })

            Scenario(`Scenario steps(s) validation`, ({ Given, When, Then, And }) => {
                Given(`Developer one more time vitest-cucumber`, () => {})
                When(`I forgot a scenario step`, () => {})
                Then(`vitest-cucumber throw an error`, () => {})
                And(`I know which steps are missing`, () => {})
            })

            ScenarioOutline(`Run scenario outline with exemples`, ({ Given, When, Then, And }, variables) => {                
                Given(`Developer one more time vitest-cucumber`, () => {})
                When(`I run a scenario outline for a <framework>`, () => {})
                And(`I use it for a <language>`, () => {})
                Then(`I can use variables in my tests`, () => {
                    expect(variables.framework).toEqual(
                        expect.arrayContaining([`Vue`]),
                    )
                    expect(variables.language).toEqual(
                        expect.arrayContaining([`Typescript`]),
                    )
                })
            })

        }),

    ).not.toThrowError()
})
