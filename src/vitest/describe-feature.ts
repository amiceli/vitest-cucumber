import {
    describe, test, afterAll, beforeAll,
} from "vitest"
import { FeatureStateDetector, ScenarioStateDetector } from './feature-state'
import { Feature } from "../parser/feature"
import {
    StepCallbackDefinition,
    StepTest,
    MaybePromise,
    FeatureDescribeCallback,
    FeatureDescriibeCallbackParams,
} from './types'
import { Example, ScenarioOutline } from "../parser/scenario"
import { Step } from "../parser/step"

type ScenarioSteps = {
    key : string
    fn : () => MaybePromise
    step : Step       
}

export function describeFeature (
    feature: Feature,
    featureFn: FeatureDescribeCallback,
) {
    let beforeAllScenarioHook : () => MaybePromise = () => {}
    let beforeEachScenarioHook :() => MaybePromise = () => {}
    let afterAllScenarioHook : () => MaybePromise = () => {}
    let afterEachScenarioHook : () => MaybePromise = () => {}

    const scenarioToRun : Array< () => void> = []

    const descibeFeatureParams : FeatureDescriibeCallbackParams = {
        Scenario : (
            scenarioDescription: string, 
            scenarioTestCallback: (op: StepTest) => MaybePromise,
        ) => {
            const foundScenario = FeatureStateDetector
                .forFeature(feature)
                .checkIfScenarioExists(scenarioDescription)
            const scenarioStepsToRun : ScenarioSteps[]  = []

            const createScenarioStepCallback = (stepType: string): StepCallbackDefinition => {
                return (
                    stepDetails: string, 
                    scenarioStepCallback: () => void,
                ) => {
                    const foundStep = ScenarioStateDetector
                        .forScenario(foundScenario)
                        .checkIfStepExists(stepType, stepDetails)
 
                    scenarioStepsToRun.push({
                        key : `${stepType} ${stepDetails}`,
                        fn : scenarioStepCallback,
                        step : foundStep,
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

            FeatureStateDetector
                .forFeature(feature)
                .scenarioShouldNotBeOutline(foundScenario)
            
            scenarioTestCallback(scenarioStepsCallback)

            scenarioToRun.push(() => {
                describe(scenarioDescription, () => {
                    beforeAll(() => {
                        beforeEachScenarioHook()
                    })

                    afterAll(() => {
                        ScenarioStateDetector 
                            .forScenario(foundScenario)
                            .checkIfStepWasCalled()
    
                        foundScenario.isCalled = true

                        afterEachScenarioHook()
                    })

                    test.each(scenarioStepsToRun)(`$key`, async (scenarioStep) => {
                        await scenarioStep.fn()
                        scenarioStep.step.isCalled = true
                    })
                })
            })
        },
        ScenarioOutline : (
            scenarioDescription: string, 
            scenarioTestCallback: (op: StepTest, variables : Example[0]) => MaybePromise,
        ) => {
            const foundScenario = FeatureStateDetector
                .forFeature(feature)
                .checkIfScenarioExists<ScenarioOutline>(scenarioDescription)
            let scenarioStepsToRun : ScenarioSteps[]  = []

            const createScenarioStepCallback = (stepType: string): StepCallbackDefinition => {
                return (
                    stepDetails: string, 
                    scenarioStepCallback: () => void,
                ) => {
                    const foundStep = ScenarioStateDetector
                        .forScenario(foundScenario)
                        .checkIfStepExists(stepType, stepDetails)
 
                    scenarioStepsToRun.push({
                        key : `${stepType} ${stepDetails}`,
                        fn : scenarioStepCallback,
                        step : foundStep,
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

            FeatureStateDetector
                .forFeature(feature)
                .scenarioShouldBeOutline(foundScenario)

            ScenarioStateDetector
                .forScenario(foundScenario)
                .checkExemples()
            
            const example = feature.getScenarioExample(scenarioDescription)
                
            if (example)  {
                example.forEach((exampleVariables) => {
                    scenarioStepsToRun = []
                    scenarioTestCallback(scenarioStepsCallback, exampleVariables)

                    scenarioToRun.push(((steps) => () => {
                        describe(scenarioDescription, () => {
                            beforeAll(() => {
                                beforeEachScenarioHook()
                            })
            
                            afterAll(() => {
                                ScenarioStateDetector 
                                    .forScenario(foundScenario)
                                    .checkIfStepWasCalled()
                
                                foundScenario.isCalled = true
            
                                afterEachScenarioHook()
                            })
            
                            test.each(steps)(`$key`, async (scenarioStep) => {
                                await scenarioStep.fn()
                                scenarioStep.step.isCalled = true
                            })
                        })
                    })([...scenarioStepsToRun]))
                })
            }
        },
        BeforeEachScenario : (fn : () => MaybePromise) => {
            beforeEachScenarioHook = fn
        },
        BeforeAllScenarios : (fn : () => MaybePromise) => {
            beforeAllScenarioHook = fn
        },
        AfterAllScenarios : (fn : () => MaybePromise) => {
            afterAllScenarioHook = fn
        },
        AfterEachScenario : (fn : () => MaybePromise) => {
            afterEachScenarioHook = fn
        },
    }

    describe(feature.name, async () => {
        await featureFn(descibeFeatureParams)

        beforeAll(() => {
            beforeAllScenarioHook()
        })

        afterAll(() => {
            FeatureStateDetector
                .forFeature(feature)
                .checkNotCalledScenario()
            
            afterAllScenarioHook()
        })

        scenarioToRun.forEach((scenario) => scenario())
    })
}
