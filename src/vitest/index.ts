import { describe, test, } from "vitest"
import chalk from 'chalk'
// 
import {
    stepCallbackDefinition,
    StepTest,
    ScenarioTest,
    MaybePromise,
} from './types'
import {
    scenarioDoestNotExist,
    stepDoesNotExist,
    stepIsNoCalled,
    displayNoCalledStepsError,
} from './displayMessage'
import {
    loadFeature, loadFeatures
} from './loadFeature'
import { Feature } from "../parser/feature"


export async function describeFeature(
    feature: Feature,
    fn: (
        scenarioCallback: { Scenario: ScenarioTest }
    ) => MaybePromise
) {
    const descibeFeatureParams = {
        Scenario: (
            scenarioTitle: string, 
            scenarioTestCallback: (op: StepTest) => MaybePromise
        ) => {
            const foundScenario = feature.getScenarioByName(scenarioTitle)

            if (!foundScenario) {
                scenarioDoestNotExist(scenarioTitle)
                return
            }

            describe(scenarioTitle, () => {
                const createScenarioStepCallback = (type: string): stepCallbackDefinition => {
                    return (scenarioStepTittle: string, scenarioStepCallback: Function) => {
                        const foundStep = foundScenario.getStepByNameAndTitle(
                            type, scenarioStepTittle,
                        )

                        if (!foundStep) {
                            stepDoesNotExist(type, scenarioStepTittle)
                            return
                        }

                        test(`${chalk.bold(type)} ${scenarioStepTittle}`, () => {
                            scenarioStepCallback()

                            foundStep.isCalled = true
                        })
                    }
                }

                const scenarioStepsCallback: StepTest = {
                    Given: createScenarioStepCallback('Given'),
                    When: createScenarioStepCallback('When'),
                    And: createScenarioStepCallback('And'),
                    Then: createScenarioStepCallback('Then'),
                    But: createScenarioStepCallback('But'),
                }

                scenarioTestCallback(scenarioStepsCallback)
            }).on('afterAll', () => {
                foundScenario.isCalled = true

                if (foundScenario.hasUnCalledSteps()) {
                    const errorMessage = displayNoCalledStepsError(foundScenario)

                    throw errorMessage
                }
            })
        }
    }

    describe(feature.name, () => {
        fn(descibeFeatureParams)
    }).on('afterAll', () => {
        const noCalledScenario = feature.getNotCalledFirstScenario()
        
        if (noCalledScenario) {
            throw `Scenario: ${noCalledScenario.name} not called`
        }
    })
}

export {
    loadFeatures,
    loadFeature,
}