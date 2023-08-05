import { describe, test } from "vitest"
import { FeatureStateDetector, ScenarioStateDetector } from './feature-state'
import { Feature } from "../parser/feature"
import { 
    StepCallbackDefinition,
    StepTest,
    MaybePromise,
    FeatureDescribeCallback,
} from './types'

export function describeFeature (
    feature: Feature,
    featureFn: FeatureDescribeCallback,
) {
    const descibeFeatureParams = {
        Scenario : (
            scenarioDescription: string, 
            scenarioTestCallback: (op: StepTest) => MaybePromise,
        ) => {
            const foundScenario = FeatureStateDetector
                .forFeature(feature)
                .checkIfScenarioExists(scenarioDescription)

            describe(scenarioDescription, () => {
                const createScenarioStepCallback = (stepType: string): StepCallbackDefinition => {
                    return (
                        stepDetails: string, 
                        scenarioStepCallback: () => void,
                    ) => {
                        const foundStep = ScenarioStateDetector
                            .forScenario(foundScenario)
                            .checkIfStepExists(stepType, stepDetails)

                        test(`${stepType} ${stepDetails}`, () => {
                            scenarioStepCallback()

                            foundStep.isCalled = true
                        })
                    }
                }

                const scenarioStepsCallback: StepTest = {
                    Given : createScenarioStepCallback(`Given`),
                    When : createScenarioStepCallback(`When`),
                    And : createScenarioStepCallback(`And`),
                    Then : createScenarioStepCallback(`Then`),
                    But : createScenarioStepCallback(`But`),
                }

                scenarioTestCallback(scenarioStepsCallback)
            }).on(`afterAll`, () => {
                foundScenario.isCalled = true

                ScenarioStateDetector 
                    .forScenario(foundScenario)
                    .checkIfStepWasCalled()
            })
        },
    }

    describe(feature.name, () => {
        featureFn(descibeFeatureParams)
    }).on(`afterAll`, () => {
        FeatureStateDetector
            .forFeature(feature)
            .checkNotCalledScenario()
    })
}
