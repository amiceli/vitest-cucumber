import { describe, expect, test, vi } from 'vitest'
import { defineFeature } from '../define-feature'

defineFeature('Define feature without Gherkin', (f) => {
    let count: number = 0
    const testFn = vi.fn()

    f.AfterEachScenario(() => {
        vi.resetAllMocks()
    })

    f.BeforeEachScenario(() => {
        count += 1
    })

    f.Background((b) => {
        b.Given('I love Background', () => {
            testFn()
        })
    })

    f.Scenario('Use Scenario', (s) => {
        s.context.details = ''

        s.Given('I use scenario', () => {
            expect(s.context.details).toEqual('')
        })
        s.When('I use step', () => {
            s.context.details = 'When'
        })
        s.Then('Code is executed', () => {
            expect(count).toEqual(1)
            expect(testFn).toHaveBeenCalledTimes(1)
        })
    })

    f.Rule('Vitest', (r) => {
        r.context.tests = 1
        r.context.testFn = vi.fn()

        r.RuleBackground.skip((b) => {
            b.Given('I love vitest', () => {
                r.context.tests += 1
                r.context.testFn()
            })
        })
    })
})

describe('Keep describeFeature checks', () => {
    describe('Same steps', () => {
        expect(() => {
            defineFeature('Same steps', (f) => {
                f.Scenario('Example', (s) => {
                    s.Given('I rune vitest', () => {})
                    s.Given('I rune vitest', () => {})
                })
            })
        }).toThrow('Scenario: Example already has Given I rune vitest')
    })
})

defineFeature('Define feature with ScenarioOutline', (f) => {
    const seen: Array<{
        name: string
        age: number
    }> = []

    f.ScenarioOutline(
        'Outline with examples',
        (s, variables) => {
            s.Given('user <name> is <age> years old', () => {
                seen.push({
                    name: String(variables.name),
                    age: Number(variables.age),
                })
            })
            s.Then('values are recorded', () => {
                expect(seen.length).toBeGreaterThan(0)
            })
        },
        [
            {
                name: 'Alice',
                age: 30,
            },
            {
                name: 'Bob',
                age: 42,
            },
        ],
    )
})

describe('defineFeature ScenarioOutline checks', () => {
    test('throws when examples array is empty', () => {
        expect(() => {
            defineFeature('Empty examples', (f) => {
                f.ScenarioOutline(
                    'Empty',
                    (s) => {
                        s.Given('a <key> step', () => {})
                    },
                    [],
                )
            })
        }).toThrow('Scenario Outline: Empty \n has an empty Examples')
    })

    test('throws when an example value is missing', () => {
        expect(() => {
            defineFeature('Missing value', (f) => {
                f.ScenarioOutline(
                    'Missing',
                    (s) => {
                        s.Given('user <name>', () => {})
                    },
                    [
                        {
                            name: 'Alice',
                        },
                        {
                            name: undefined,
                        },
                    ],
                )
            })
        }).toThrow(
            'Scenario Outline: Missing \n missing name value in Examples',
        )
    })
})

defineFeature('Define feature with Rule and ScenarioOutline', (f) => {
    f.Rule('Compute', (r) => {
        const computed: number[] = []

        r.RuleScenarioOutline(
            'Doubles values',
            (s, variables) => {
                s.Given('I have <input>', () => {
                    computed.push(Number(variables.input) * 2)
                })
                s.Then('I get <expected>', () => {
                    expect(computed.at(-1)).toEqual(variables.expected)
                })
            },
            [
                {
                    input: 2,
                    expected: 4,
                },
                {
                    input: 5,
                    expected: 10,
                },
            ],
        )
    })
})

describe('defineFeature Rule.RuleScenarioOutline checks', () => {
    test('throws when rule outline examples are empty', () => {
        expect(() => {
            defineFeature('Rule empty examples', (f) => {
                f.Rule('R', (r) => {
                    r.RuleScenarioOutline(
                        'Empty',
                        (s) => {
                            s.Given('a <k>', () => {})
                        },
                        [],
                    )
                })
            })
        }).toThrow('Scenario Outline: Empty \n has an empty Examples')
    })

    test('throws when rule outline value is missing', () => {
        expect(() => {
            defineFeature('Rule missing value', (f) => {
                f.Rule('R', (r) => {
                    r.RuleScenarioOutline(
                        'Missing',
                        (s) => {
                            s.Given('user <name>', () => {})
                        },
                        [
                            {
                                name: 'Alice',
                            },
                            {
                                name: undefined,
                            },
                        ],
                    )
                })
            })
        }).toThrow(
            'Scenario Outline: Missing \n missing name value in Examples',
        )
    })
})
