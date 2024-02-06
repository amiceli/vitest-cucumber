import {
    describe, afterAll, beforeAll,
} from "vitest"
import { Feature } from "../parser/feature"
import {
    StepTest,
    MaybePromise,
    FeatureDescribeCallback,
    FeatureDescriibeCallbackParams,
} from './types'
import { Example } from "../parser/scenario"
import { describeScenario } from "./describe/scenario"
import { describeScenarioOutline } from "./describe/scenarioOutline"
import {
    checkScenarioInFeature, checkScenarioInRule, checkScenarioOutlineInFeature, checkScenarioOutlineInRule,
} from "./state-detectors"
import { FeatureStateDetector } from "./state-detectors/FeatureStateDetector"
import { detectNotCalledRuleScenario, detectUnCalledScenarioAndRules } from "./describe/teardowns"

export function describeFeature (
    feature: Feature,
    featureFn: FeatureDescribeCallback,
) {
    let beforeAllScenarioHook: () => MaybePromise = () => { }
    let beforeEachScenarioHook: () => MaybePromise = () => { }
    let afterAllScenarioHook: () => MaybePromise = () => { }
    let afterEachScenarioHook: () => MaybePromise = () => { }

    const scenarioToRun: Array<() => void> = []
    const rulesToRun: Array<() => void> = []

    const descibeFeatureParams: FeatureDescriibeCallbackParams = {
        Scenario : (
            scenarioDescription: string,
            scenarioTestCallback: (op: StepTest) => MaybePromise,
        ) => {
            const scenario = checkScenarioInFeature(scenarioDescription, feature)

            scenarioToRun.push(
                describeScenario({
                    scenario,
                    scenarioTestCallback,
                    beforeEachScenarioHook,
                    afterEachScenarioHook,
                }),
            )
        },
        ScenarioOutline : (
            scenarioDescription: string,
            scenarioTestCallback: (op: StepTest, variables: Example[0]) => MaybePromise,
        ) => {
            const scenario = checkScenarioOutlineInFeature(scenarioDescription, feature)

            scenarioToRun.push(
                ...describeScenarioOutline({
                    scenario,
                    scenarioTestCallback,
                    beforeEachScenarioHook,
                    afterEachScenarioHook,
                }),
            )
        },
        Rule : async (
            ruleName: string,
            ruleCallback,
        ) => {
            const rulesScenarios: Array<() => void> = []
            const currentRule = FeatureStateDetector
                .forFeature(feature)
                .checkIfRuleExists(ruleName)

            await ruleCallback({
                RuleScenario : (
                    scenarioDescription: string,
                    scenarioTestCallback: (op: StepTest) => MaybePromise,
                ) => {
                    const scenario = checkScenarioInRule(scenarioDescription, currentRule)

                    rulesScenarios.push(
                        describeScenario({
                            scenario,
                            scenarioTestCallback,
                            beforeEachScenarioHook,
                            afterEachScenarioHook,
                        }),
                    )
                },
                RuleScenarioOutline : (
                    scenarioDescription: string,
                    scenarioTestCallback: (op: StepTest, variables: Example[0]) => MaybePromise,
                ) => {
                    const scenario = checkScenarioOutlineInRule(scenarioDescription, currentRule)

                    rulesScenarios.push(
                        ...describeScenarioOutline({
                            scenario,
                            scenarioTestCallback,
                            beforeEachScenarioHook,
                            afterEachScenarioHook,
                        }),
                    )
                },
            })

            rulesToRun.push(() => {
                describe(`Rule: ${ruleName}`, () => {
                    beforeAll(async () => {
                        await beforeAllScenarioHook()
                    })
                    afterAll(async () => {
                        detectNotCalledRuleScenario(currentRule)
                        currentRule.isCalled = true

                        await afterAllScenarioHook()
                    })
                    rulesScenarios.forEach((scenario) => scenario())
                })
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

    describe(feature.name, async () => {
        await featureFn(descibeFeatureParams)

        beforeAll(async () => {
            await beforeAllScenarioHook()
        })

        afterAll(async () => {
            detectUnCalledScenarioAndRules(feature)

            await afterAllScenarioHook()
        })

        scenarioToRun.forEach((scenario) => scenario())
        rulesToRun.forEach((rule) => rule())
    })
}
