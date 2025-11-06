import { expect, vi } from 'vitest'
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
})
