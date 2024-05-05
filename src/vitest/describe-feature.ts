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
import { createScenarioDescribeHandler } from "./describe/describeScenario"
import { createScenarioOutlineDescribeHandler } from "./describe/describeScenarioOutline"
import {
    checkIfBackgroundExistInParent,
    checkScenarioInFeature, checkScenarioInRule, checkScenarioOutlineInFeature, checkScenarioOutlineInRule,
} from "./state-detectors"
import { FeatureStateDetector } from "./state-detectors/FeatureStateDetector"
import { detectNotCalledRuleScenario, detectUnCalledScenarioAndRules } from "./describe/teardowns"
import { createBackgroundDescribeHandler } from "./describe/describeBackground"

export type DescribeFeatureOptions = {
    excludeTags? : string[]
}

type DescribesToRun = Array<{
    describeTitle : string,
    describeHandler : () => void
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

    const scenarioToRun: DescribesToRun = []
    const rulesToRun: DescribesToRun = []
    let featureBackground : DescribesToRun[0] | null = null

    const descibeFeatureParams: FeatureDescriibeCallbackParams = {
        Background : (
            backgroundCallback: (op: BackgroundStepTest) => MaybePromise,
        ) => {
            const background = checkIfBackgroundExistInParent({
                parent : feature,
                excludeTags : describeOptions?.excludeTags || [],
            })

            featureBackground = {
                describeTitle : `Background`,
                describeHandler : createBackgroundDescribeHandler({
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
                describeTitle : `Scenario: ${scenario.description}`,
                describeHandler : createScenarioDescribeHandler({
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
                ...createScenarioOutlineDescribeHandler({
                    scenario,
                    scenarioTestCallback,
                    beforeEachScenarioHook,
                    afterEachScenarioHook,
                }).map((t) => ({
                    describeTitle : `Scenario Outline: ${scenario.description}`,
                    describeHandler : t,
                })),
            )
        },
        Rule : async (
            ruleName: string,
            ruleCallback,
        ) => {
            const rulesScenarios: DescribesToRun = []
            const currentRule = FeatureStateDetector
                .forFeature(feature, describeOptions?.excludeTags || [])
                .checkIfRuleExists(ruleName)
            
            let ruleBackground : DescribesToRun[0] | null = null

            await ruleCallback({
                RuleBackground : (
                    backgroundCallback: (op: BackgroundStepTest) => MaybePromise,
                ) => {
                    const background = checkIfBackgroundExistInParent({
                        parent : currentRule,
                        excludeTags : describeOptions?.excludeTags || [],
                    })

                    ruleBackground = {
                        describeTitle : `Background`,
                        describeHandler : createBackgroundDescribeHandler({
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
                        describeTitle : `Scenario: ${scenario.description}`,
                        describeHandler : createScenarioDescribeHandler({
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
                        ...createScenarioOutlineDescribeHandler({
                            scenario,
                            scenarioTestCallback,
                            beforeEachScenarioHook,
                            afterEachScenarioHook,
                        }).map((t) => ({
                            describeTitle : `Scenario Outline: ${scenario.description}`,
                            describeHandler : t,
                        })),
                    )
                },
            })

            rulesToRun.push({
                describeTitle : `Rule: ${ruleName}`,
                describeHandler : function describeRule () {
                    beforeAll(async () => {
                        await beforeAllScenarioHook()
                    })
                    afterAll(async () => {
                        detectNotCalledRuleScenario(currentRule, describeOptions?.excludeTags || [])
                        currentRule.isCalled = true

                        await afterAllScenarioHook()
                    })

                    const everythingRule : DescribesToRun = []

                    rulesScenarios.forEach((ruleScenario) => {
                        if (featureBackground) {
                            everythingRule.push(featureBackground)
                        }
                        if (ruleBackground) {
                            everythingRule.push(ruleBackground)
                        }
                        everythingRule.push(ruleScenario)
                    })

                    describe.each(
                        everythingRule.map((s) => {
                            return [
                                s.describeTitle,
                                s,
                            ]
                        }),
                    )(`%s`, (_, { describeHandler }) => {describeHandler()})
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

        let everything : DescribesToRun = []

        scenarioToRun.forEach((featureScenario) => {
            if (featureBackground) {
                everything.push(featureBackground)
            }

            everything.push(featureScenario)
        })

        everything = everything.concat(rulesToRun)

        describe.each(
            everything.map((s) => {
                return [
                    s.describeTitle,
                    s,
                ]
            }),
        )(`%s`, (_, { describeHandler }) => {describeHandler()})
    })
}
