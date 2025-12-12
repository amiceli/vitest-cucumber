import { expect } from 'vitest'
import { defineSteps } from '../configuration'
import { describeFeature } from '../describe-feature'
import { loadFeature } from '../load-feature'
import type { StepTest } from '../types'

const feature = await loadFeature(
    'src/vitest/__tests__/shared-step-expression.feature',
)

type WorkspaceContext = {
    workspace: string
}

// Define shared steps with expression parameters
defineSteps(({ Given }) => {
    Given('a workspace {string} exists', (_ctx, name: string) => {
        expect(name).toBe('Test Workspace')
    })
})

describeFeature(feature, (f) => {
    f.Scenario(
        'Use shared step with string parameter',
        (s: StepTest<WorkspaceContext>) => {
            s.context.workspace = 'Test Workspace'
            // Given is handled by defineSteps above
            s.When('I do something', () => {
                expect(s.context.workspace).toBe('Test Workspace')
            })
            s.Then('it works', () => {
                // Success!
            })
        },
    )
})
