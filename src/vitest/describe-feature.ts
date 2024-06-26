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
import { createBackgroundDescribeHandler } from "./describe/describeBackground"
import { ScenarioStateDetector } from "./state-detectors/ScenarioStateDetector"

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

    const excludeTags = describeOptions?.excludeTags || []

    const scenarioToRun: DescribesToRun = []
    const rulesToRun: DescribesToRun = []
    let featureBackground : DescribesToRun[0] | null = null

    const descibeFeatureParams: FeatureDescriibeCallbackParams = {
        Background : (
            backgroundCallback: (op: BackgroundStepTest) => MaybePromise,
        ) => {
            const background = feature.getBackground()
            background.isCalled = true

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
            const scenario = feature.getScenario(scenarioDescription)
            scenario.isCalled = true

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
            const scenario = feature.getScenarioOutline(scenarioDescription)

            ScenarioStateDetector
                .forScenario(scenario)
                .checkExemples()

            scenario.isCalled = true

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
        Rule : (
            ruleName: string,
            ruleCallback,
        ) => {
            const rulesScenarios: DescribesToRun = []
            const currentRule = feature.checkIfRuleExists(ruleName)
            
            currentRule.isCalled = true

            let ruleBackground : DescribesToRun[0] | null = null

            ruleCallback({
                RuleBackground : (
                    backgroundCallback: (op: BackgroundStepTest) => MaybePromise,
                ) => {
                    const background = currentRule.getBackground()
                    background.isCalled = true

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
                    const scenario = currentRule.getScenario(scenarioDescription)
                    scenario.isCalled = true

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
                    const scenario = currentRule.getScenarioOutline(scenarioDescription)

                    ScenarioStateDetector
                        .forScenario(scenario)
                        .checkExemples()

                    scenario.isCalled = true

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
            
            currentRule
                .checkUncalledScenario(excludeTags)
                .checkUncalledBackground(excludeTags)

            rulesToRun.push({
                describeTitle : `Rule: ${ruleName}`,
                describeHandler : function describeRule () {
                    beforeAll(async () => {
                        await beforeAllScenarioHook()
                    })
                    afterAll(async () => {
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

    featureFn(descibeFeatureParams)

    feature
        .checkUncalledRule(excludeTags)
        .checkUncalledScenario(excludeTags)
        .checkUncalledBackground(excludeTags)

    describe(`Feature: ${feature.name}`, async () => {
        beforeAll(async () => {
            await beforeAllScenarioHook()
        })

        afterAll(async () => {
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
