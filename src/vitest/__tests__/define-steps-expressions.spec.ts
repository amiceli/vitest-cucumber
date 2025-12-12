import { expect } from 'vitest'
import { defineSteps, resetDefinedSteps } from '../configuration'
import { describeFeature } from '../describe-feature'
import { loadFeature } from '../load-feature'

const feature = await loadFeature(
    'src/vitest/__tests__/define-steps-expressions.feature',
)

resetDefinedSteps()

defineSteps(({ Given, When, Then }) => {
    Given('a workspace {string} exists', (_ctx, name: string) => {
        expect(name).toBe('Test Workspace')
    })

    When('I create a project {string}', (_ctx, projectName: string) => {
        expect(projectName).toBe('Demo Project')
    })

    Then('the project {string} should exist', (_ctx, projectName: string) => {
        expect(projectName).toBe('Demo Project')
    })

    Given('I have {number} items', (_ctx, count: number) => {
        expect(count).toBe(5)
    })

    When('I add {number} more items', (_ctx, count: number) => {
        expect(count).toBe(3)
    })

    Then('I should have {number} items', (_ctx, count: number) => {
        expect(count).toBe(8)
    })
})

describeFeature(feature, (f) => {
    f.Scenario('Test string parameter extraction', () => {})
    f.Scenario('Test number parameter extraction', () => {})
    f.ScenarioOutline('Test expression parameters with outline', () => {})
})
