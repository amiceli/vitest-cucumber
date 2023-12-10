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
import { Example, Scenario } from "../parser/scenario"
import { NotScenarioOutlineError, IsScenarioOutlineError } from '../errors/errors'

function initializeHook (
    feature : Feature, 
    hook : string, 
) {
    FeatureStateDetector  
        .forFeature(feature)
        .alreadyCalledScenarioAtStart(hook)
}

function getScenario (feature : Feature, scenarioDescription : string) {
    return FeatureStateDetector
        .forFeature(feature)
        .checkIfScenarioExists(scenarioDescription)
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
            const foundScenario = getScenario(feature, scenarioDescription)

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

                if (feature.isOutline(scenarioDescription)) {
                    throw new IsScenarioOutlineError(new Scenario(scenarioDescription))
                } else {
                    scenarioTestCallback(scenarioStepsCallback)
                }
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
        ScenarioOutline : (
            scenarioDescription: string, 
            scenarioTestCallback: (op: StepTest, variables : Example[0]) => MaybePromise,
        ) => {
            const foundScenario = getScenario(feature, scenarioDescription)

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

                ScenarioStateDetector
                    .forScenario(foundScenario)
                    .checkExemples()

                if (beforeAllHook) {
                    beforeAllHook()
                    beforeAllHook = null
                }

                if (beforeEachHook) {
                    beforeEachHook()
                }

                if (feature.isOutline(scenarioDescription)) {
                    const example = feature.getScenarioExample(scenarioDescription)

                    if (example)  {
                        example.forEach((exampleVariables) => {
                            scenarioTestCallback(scenarioStepsCallback, exampleVariables)
                        })
                    }
                } else {
                    throw new NotScenarioOutlineError(new Scenario(scenarioDescription))
                }
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
