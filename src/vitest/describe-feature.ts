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

function initializeHook (
    feature : Feature, 
    hook : string, 
) {
    FeatureStateDetector  
        .forFeature(feature)
        .alreadyCalledScenarioAtStart(hook)
}

export function describeFeature (
    feature: Feature,
    featureFn: FeatureDescribeCallback,
) {
    let beforeAllHook : (() => void) | null = null
    let beforeEachHook : (() => void) | null = null
    let afterAllHook : (() => void) | null = null
    let afterEachHook : (() => void) | null = null

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

                if (beforeAllHook) {
                    beforeAllHook()
                    beforeAllHook = null
                }

                if (beforeEachHook) {
                    beforeEachHook()
                }
                
                scenarioTestCallback(scenarioStepsCallback)
            }).on(`afterAll`, () => {
                foundScenario.isCalled = true
                
                if (afterEachHook) {
                    afterEachHook()
                }

                ScenarioStateDetector 
                    .forScenario(foundScenario)
                    .checkIfStepWasCalled()
            })
        },
        BeforeEachScenario : (fn : () => MaybePromise) => {
            initializeHook(feature, `BeforeEachScenario`)
            beforeEachHook = fn
        },
        BeforeAllScenarios : (fn : () => MaybePromise) => {
            initializeHook(feature, `BeforeAllScenarios`)
            beforeAllHook = fn
        },
        AfterAllScenarios : (fn : () => MaybePromise) => {
            initializeHook(feature, `AfterAllScenarios`)
            afterAllHook = fn
        },
        AfterEachScenario : (fn : () => MaybePromise) => {
            initializeHook(feature, `AfterEachScenario`)
            afterEachHook = fn
        },
    }

    describe(feature.name, () => {
        featureFn(descibeFeatureParams)
    }).on(`afterAll`, () => {
        if (afterAllHook) {
            afterAllHook()
        }

        FeatureStateDetector
            .forFeature(feature)
            .checkNotCalledScenario()
    })
}
