import { initializeFeature } from "../src/vitest"
import { expect } from 'vitest'

const path = 'examples/index.feature'
const FeatureTest = await initializeFeature(path)

FeatureTest.describe('Use Gherkin in my unit tests', ({ Scenario }) => {

    Scenario(`Detect when step isn't tested`, ({ Given, When, And, Then }) => {

        Given('Front end developer using vitest', () => {
            expect(true).toBeTruthy()
        })

        When('I run my unit tests with vitest', () => {
            expect(false).toBeFalsy()
        })

        And('I forgot to test my Given scenario step', () => {
            expect(true).toBeTruthy()
        })

        Then('My test failed', () => {
            expect(true).toBeTruthy()
        })

        And('I know with step I forgot', () => {
            expect(true).toBeTruthy()
        })

    })

})
