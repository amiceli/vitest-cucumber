import { describe, expect, vi } from 'vitest'
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
