import { initializeFeature } from "../src/vitest"
import { expect } from 'vitest'

const path = './index.feature'
const FeatureTest = await initializeFeature(path)

FeatureTest.describe('Gestion des audiences', ({ Scenario }) => {

    Scenario('Modifier les domaines', ({ Given, When, And, Then }) => {

        Given('ETQ admin dans la page des audiences', () => {
            expect(true).toBeTruthy()
        })

        When('Je coche ou décoche des domaines dans la liste', () => {
            expect(false).toBeFalsy()
        })

        And('Que je sauvegarde', () => {
            expect(true).toBeTruthy()
        })

        Then('Mes modifications sont sauvegardées', () => {
            expect(true).toBeTruthy()
        })

    })

})
