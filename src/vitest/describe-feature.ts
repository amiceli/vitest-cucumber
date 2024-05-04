import {
    describe, afterAll, beforeAll,
} from "vitest"
import { Feature } from "../parser/feature"
import {
    StepTest,
    MaybePromise,
    FeatureDescribeCallback,
    FeatureDescriibeCallbackParams,
    BackgroundStepTest,
} from './types'
import { Example } from "../parser/scenario"
import { describeScenario } from "./describe/scenario"
import { describeScenarioOutline } from "./describe/scenarioOutline"
import {
    checkIfBackgroundExistInParent,
    checkScenarioInFeature, checkScenarioInRule, checkScenarioOutlineInFeature, checkScenarioOutlineInRule,
} from "./state-detectors"
import { FeatureStateDetector } from "./state-detectors/FeatureStateDetector"
import { detectNotCalledRuleScenario, detectUnCalledScenarioAndRules } from "./describe/teardowns"
import { describeBackground } from "./describe/background"

export type DescribeFeatureOptions = {
    excludeTags? : string[]
}

type ScenariiToRun = Array<{
    type : string,
    fn : () => void
}>

export function describeFeature (
    feature: Feature,
    featureFn: FeatureDescribeCallback,
    describeOptions? : DescribeFeatureOptions,
) {
    let beforeAllScenarioHook: () => MaybePromise = () => { }
    let beforeEachScenarioHook: () => MaybePromise = () => { }
    let afterAllScenarioHook: () => MaybePromise = () => { }
    let afterEachScenarioHook: () => MaybePromise = () => { }

    const scenarioToRun: ScenariiToRun = []
    const rulesToRun: ScenariiToRun = []
    let featureBackground : ScenariiToRun[0] | null = null

    const descibeFeatureParams: FeatureDescriibeCallbackParams = {
        Background : (
            backgroundCallback: (op: BackgroundStepTest) => MaybePromise,
        ) => {
            const background = checkIfBackgroundExistInParent({
                parent : feature,
                excludeTags : describeOptions?.excludeTags || [],
            })

            featureBackground = {
                type : `Background`,
                fn : describeBackground({
                    background,
                    backgroundCallback,
                }),
            }
        },
        Scenario : (
            scenarioDescription: string,
            scenarioTestCallback: (op: StepTest) => MaybePromise,
        ) => {
            const scenario = checkScenarioInFeature({
                scenarioDescription,
                parent : feature,
                excludeTags : describeOptions?.excludeTags || [],
            })

            scenarioToRun.push({
                type : `Scenario`,
                fn : describeScenario({
                    scenario,
                    scenarioTestCallback,
                    beforeEachScenarioHook,
                    afterEachScenarioHook,
                }),
            })
        },
        ScenarioOutline : (
            scenarioDescription: string,
            scenarioTestCallback: (op: StepTest, variables: Example[0]) => MaybePromise,
        ) => {
            const scenario = checkScenarioOutlineInFeature({
                scenarioDescription,
                parent : feature,
                excludeTags : describeOptions?.excludeTags || [],
            })

            scenarioToRun.push(
                ...describeScenarioOutline({
                    scenario,
                    scenarioTestCallback,
                    beforeEachScenarioHook,
                    afterEachScenarioHook,
                }).map((t) => ({ type : `ScenarioOutline`, fn : t })),
            )
        },
        Rule : async (
            ruleName: string,
            ruleCallback,
        ) => {
            const rulesScenarios: ScenariiToRun = []
            const currentRule = FeatureStateDetector
                .forFeature(feature, describeOptions?.excludeTags || [])
                .checkIfRuleExists(ruleName)
            
            let ruleBackground : ScenariiToRun[0] | null = null

            await ruleCallback({
                RuleBackground : (
                    backgroundCallback: (op: BackgroundStepTest) => MaybePromise,
                ) => {
                    const background = checkIfBackgroundExistInParent({
                        parent : currentRule,
                        excludeTags : describeOptions?.excludeTags || [],
                    })

                    ruleBackground = {
                        type : `RuleBackground`,
                        fn : describeBackground({
                            background,
                            backgroundCallback,
                        }),
                    }
                },
                RuleScenario : (
                    scenarioDescription: string,
                    scenarioTestCallback: (op: StepTest) => MaybePromise,
                ) => {
                    const scenario = checkScenarioInRule({
                        scenarioDescription,
                        parent : currentRule,
                        excludeTags : describeOptions?.excludeTags || [],
                    })

                    rulesScenarios.push({
                        type : `Scenario`,
                        fn : describeScenario({
                            scenario,
                            scenarioTestCallback,
                            beforeEachScenarioHook,
                            afterEachScenarioHook,
                        }),
                    })
                },
                RuleScenarioOutline : (
                    scenarioDescription: string,
                    scenarioTestCallback: (op: StepTest, variables: Example[0]) => MaybePromise,
                ) => {
                    const scenario = checkScenarioOutlineInRule({
                        scenarioDescription,
                        parent : currentRule,
                        excludeTags : describeOptions?.excludeTags || [],
                    })

                    rulesScenarios.push(
                        ...describeScenarioOutline({
                            scenario,
                            scenarioTestCallback,
                            beforeEachScenarioHook,
                            afterEachScenarioHook,
                        }).map((t) => ({ type : `ScenarioOutline`, fn : t })),
                    )
                },
            })

            rulesToRun.push({
                type : `Rule`,
                fn : () => {
                    describe(`Rule: ${ruleName}`, () => {
                        beforeAll(async () => {
                            await beforeAllScenarioHook()
                        })
                        afterAll(async () => {
                            detectNotCalledRuleScenario(currentRule, describeOptions?.excludeTags || [])
                            currentRule.isCalled = true

                            await afterAllScenarioHook()
                        })

                        const everythingRule : ScenariiToRun = []

                        rulesScenarios.forEach((ruleScenario) => {
                            if (featureBackground) {
                                everythingRule.push(featureBackground)
                            }
                            if (ruleBackground) {
                                everythingRule.push(ruleBackground)
                            }
                            everythingRule.push(ruleScenario)
                        })

                        describe.each(everythingRule)(`$type`, ({ fn }) => {fn()})
                    })
                },
            })
        },
        BeforeEachScenario : (fn: () => MaybePromise) => {
            beforeEachScenarioHook = fn
        },
        BeforeAllScenarios : (fn: () => MaybePromise) => {
            beforeAllScenarioHook = fn
        },
        AfterAllScenarios : (fn: () => MaybePromise) => {
            afterAllScenarioHook = fn
        },
        AfterEachScenario : (fn: () => MaybePromise) => {
            afterEachScenarioHook = fn
        },
    }

    describe(`Feature: ${feature.name}`, async () => {
        await featureFn(descibeFeatureParams)

        beforeAll(async () => {
            await beforeAllScenarioHook()
        })

        afterAll(async () => {
            detectUnCalledScenarioAndRules(feature, describeOptions?.excludeTags || [])

            await afterAllScenarioHook()
        })

        let everything : ScenariiToRun = []

        scenarioToRun.forEach((featureScenario) => {
            if (featureBackground) {
                everything.push(featureBackground)
            }

            everything.push(featureScenario)
        })

        everything = everything.concat(rulesToRun)

        describe.each(everything)(`$type`, ({ fn }) => {fn()})
    })
}
