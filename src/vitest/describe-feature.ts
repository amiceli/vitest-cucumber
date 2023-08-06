import { describe, test } from "vitest"
import { FeatureStateDetector, ScenarioStateDetector } from './feature-state'
import { Feature } from "../parser/feature"
import { 
    StepCallbackDefinition,
    StepTest,
    MaybePromise,
    FeatureDescribeCallback,
    FeatureDescriibeCallbackParams,
} from './types'

function defaultScenarioHook () {
    return {
        beforeEachHook : () => {},
        afterEachHook : () => {},
        beforeAllHook : () => {},
        afterAllHook : () => {},
    }
}

export function describeFeature (
    feature: Feature,
    featureFn: FeatureDescribeCallback,
) {
    let { beforeAllHook, beforeEachHook, afterAllHook, afterEachHook } = defaultScenarioHook()

    const descibeFeatureParams : FeatureDescriibeCallbackParams = {
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

                beforeAllHook()
                beforeEachHook()

                beforeAllHook = () => {} // call one time
                
                scenarioTestCallback(scenarioStepsCallback)
            }).on(`afterAll`, () => {
                foundScenario.isCalled = true
                afterEachHook()

                ScenarioStateDetector 
                    .forScenario(foundScenario)
                    .checkIfStepWasCalled()
            })
        },
        // check they should be called before Scenario fn
        BeforeEachScenario : (fn : () => MaybePromise) => {
            beforeEachHook = fn
        },
        BeforeAllScenarios : (fn : () => MaybePromise) => {
            beforeAllHook = fn
        },
        AfterAllScenarios : (fn : () => MaybePromise) => {
            afterAllHook = fn
        },
        AfterEachScenario : (fn : () => MaybePromise) => {
            afterEachHook = fn
        },
    }

    describe(feature.name, () => {
        featureFn(descibeFeatureParams)
    }).on(`afterAll`, () => {
        afterAllHook()

        FeatureStateDetector
            .forFeature(feature)
            .checkNotCalledScenario()
    })
}
