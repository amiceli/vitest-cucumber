import {
    loadFeature, describeFeature
} from '../index'
import {
    expect, vi, test, beforeEach, it
} from 'vitest'

const feature = await loadFeature('src/vitest/__tests__/index.feature')

vi.mock('vitest', async () => {
    const mod = await vi.importActual<
        typeof import('vitest')
    >('vitest')

    return {
        ...mod,
        test : (s : string, fn : Function) => {
            fn()
        },
        describe: (s: any, fn: Function) => {
            fn()
            return {
                on: (title: string, f: Function) => {
                    f()
                }
            }
        }
    }
})

beforeEach(() => {
    vi.clearAllMocks()
})

test('Forgot a scenario', () => {
    expect(
        () => describeFeature(feature, () => {
            // 
        })
    ).toThrowError('Scenario: Forgot a scenario not called')
})

test('Bad scenario name', () => {
    expect(
        () => describeFeature(feature, ({ Scenario }) => {
            
            Scenario('Forgot a scenario', ({ Given, When, Then }) => {
                Given('Developer using vitest-gherkin', () => { })
                When('I forgot a scenario', () => {})
                Then('vitest-gherkin throw an error', () => {})
            })

            Scenario('wrong name', () => {})
        })
    ).toThrowError("Scenario: wrong name doesn't exist in Feature")
})

test('Bad step name', () => {
    expect(
        () => describeFeature(feature, ({ Scenario }) => {
            
            Scenario('Forgot a scenario', ({ Given, When, Then }) => {
                Given('Developer using vitest-cucumber', () => { })
            })

        })
    ).toThrowError("Given Developer using vitest-cucumber doesn't exist in your Scenario")
})

test('Scenario steps(s) validation', () => {
    expect(
        () => describeFeature(feature, ({ Scenario }) => {
            
            Scenario('Forgot a scenario', ({ Given, When, Then }) => {
                Given('Developer using vitest-gherkin', () => { })
                When('I forgot a scenario', () => {})
                Then('vitest-gherkin throw an error', () => {})
            })

            Scenario('Bad scenario name', ({ Given, When, Then }) => {
                Given('Developer using again vitest-gherkin', () => { })
                When('I type a wrong scenario name', () => {})
                Then('vitest-gherkin throw an error', () => {})
            })

            Scenario('Scenario steps(s) validation', ({ Given, When, Then}) => {
                Given('Developer one more time vitest-gherkin', () => {})
                When('I forgot a scenario step', () => {})
                Then('vitest-gherkin throw an error', () => {})
            })
        })

    ).toThrowError("And I know which steps are missing not called")
})

test('Everything is ok', () => {
    expect(
        () => describeFeature(feature, ({ Scenario }) => {
            
            Scenario('Forgot a scenario', ({ Given, When, Then }) => {
                Given('Developer using vitest-gherkin', () => { })
                When('I forgot a scenario', () => {})
                Then('vitest-gherkin throw an error', () => {})
            })

            Scenario('Bad scenario name', ({ Given, When, Then }) => {
                Given('Developer using again vitest-gherkin', () => { })
                When('I type a wrong scenario name', () => {})
                Then('vitest-gherkin throw an error', () => {})
            })

            Scenario('Scenario steps(s) validation', ({ Given, When, Then, And}) => {
                Given('Developer one more time vitest-gherkin', () => {})
                When('I forgot a scenario step', () => {})
                Then('vitest-gherkin throw an error', () => {})
                And('I know which steps are missing', () => {})
            })
        })

    ).not.toThrowError()
})