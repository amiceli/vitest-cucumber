import { afterAll, beforeAll, describe } from 'vitest'
import type { Feature } from '../parser/models/feature'
import type { Example } from '../parser/models/scenario'
import { getVitestCucumberConfiguration } from './configuration'
import { createBackgroundDescribeHandler } from './describe/describeBackground'
import { createScenarioDescribeHandler } from './describe/describeScenario'
import { createScenarioOutlineDescribeHandler } from './describe/describeScenarioOutline'
import { ScenarioStateDetector } from './state-detectors/ScenarioStateDetector'
import type {
    BackgroundStepTest,
    DescribeFeatureCallback,
    FeatureDescriibeCallbackParams,
    MaybePromise,
    StepTest,
} from './types'

export type DescribeFeatureOptions = {
    excludeTags?: string[]
}

type DescribesToRun = Array<{
    describeTitle: string
    describeHandler: () => void
}>

export function describeFeature(
    feature: Feature,
    describeFeatureCallback: DescribeFeatureCallback,
    describeFeatureOptions?: DescribeFeatureOptions,
) {
    let beforeAllScenarioHook: () => MaybePromise = () => {}
    let beforeEachScenarioHook: () => MaybePromise = () => {}
    let afterAllScenarioHook: () => MaybePromise = () => {}
    let afterEachScenarioHook: () => MaybePromise = () => {}

    const excludeTags =
        describeFeatureOptions?.excludeTags ||
        getVitestCucumberConfiguration().excludeTags

    const describeScenarios: DescribesToRun = []
    const describeRules: DescribesToRun = []
    let describeBackground: DescribesToRun[0] | null = null

    const descibeFeatureParams: FeatureDescriibeCallbackParams = {
        Background: (
            backgroundCallback: (op: BackgroundStepTest) => MaybePromise,
        ) => {
            const background = feature.getBackground()
            background.isCalled = true

            describeBackground = {
                describeTitle: background.getTitle(),
                describeHandler: createBackgroundDescribeHandler({
                    background,
                    backgroundCallback,
                }),
            }
        },
        Scenario: (
            scenarioDescription: string,
            scenarioTestCallback: (op: StepTest) => MaybePromise,
        ) => {
            const scenario = feature.getScenario(scenarioDescription)
            scenario.isCalled = true

            describeScenarios.push({
                describeTitle: scenario.getTitle(),
                describeHandler: createScenarioDescribeHandler({
                    scenario,
                    scenarioTestCallback,
                    beforeEachScenarioHook,
                    afterEachScenarioHook,
                }),
            })
        },
        ScenarioOutline: (
            scenarioDescription: string,
            scenarioTestCallback: (
                op: StepTest,
                variables: Example[0],
            ) => MaybePromise,
        ) => {
            const scenario = feature.getScenarioOutline(scenarioDescription)

            ScenarioStateDetector.forScenario(scenario).checkExemples()

            scenario.isCalled = true

            describeScenarios.push(
                ...createScenarioOutlineDescribeHandler({
                    scenario,
                    scenarioTestCallback,
                    beforeEachScenarioHook,
                    afterEachScenarioHook,
                }).map((t) => ({
                    describeTitle: scenario.getTitle(),
                    describeHandler: t,
                })),
            )
        },
        Rule: (ruleName: string, describeRuleCallback) => {
            const describeRuleScenarios: DescribesToRun = []
            const currentRule = feature.checkIfRuleExists(ruleName)

            currentRule.isCalled = true

            let describeRuleBackground: DescribesToRun[0] | null = null

            describeRuleCallback({
                RuleBackground: (
                    backgroundCallback: (
                        op: BackgroundStepTest,
                    ) => MaybePromise,
                ) => {
                    const background = currentRule.getBackground()
                    background.isCalled = true

                    describeRuleBackground = {
                        describeTitle: background.getTitle(),
                        describeHandler: createBackgroundDescribeHandler({
                            background,
                            backgroundCallback,
                        }),
                    }
                },
                RuleScenario: (
                    scenarioDescription: string,
                    scenarioTestCallback: (op: StepTest) => MaybePromise,
                ) => {
                    const scenario =
                        currentRule.getScenario(scenarioDescription)
                    scenario.isCalled = true

                    describeRuleScenarios.push({
                        describeTitle: scenario.getTitle(),
                        describeHandler: createScenarioDescribeHandler({
                            scenario,
                            scenarioTestCallback,
                            beforeEachScenarioHook,
                            afterEachScenarioHook,
                        }),
                    })
                },
                RuleScenarioOutline: (
                    scenarioDescription: string,
                    scenarioTestCallback: (
                        op: StepTest,
                        variables: Example[0],
                    ) => MaybePromise,
                ) => {
                    const scenario =
                        currentRule.getScenarioOutline(scenarioDescription)

                    ScenarioStateDetector.forScenario(scenario).checkExemples()

                    scenario.isCalled = true

                    describeRuleScenarios.push(
                        ...createScenarioOutlineDescribeHandler({
                            scenario,
                            scenarioTestCallback,
                            beforeEachScenarioHook,
                            afterEachScenarioHook,
                        }).map((t) => ({
                            describeTitle: scenario.getTitle(),
                            describeHandler: t,
                        })),
                    )
                },
            })

            currentRule
                .checkUncalledScenario(excludeTags)
                .checkUncalledBackground(excludeTags)

            describeRules.push({
                describeTitle: currentRule.getTitle(),
                describeHandler: function describeRule() {
                    beforeAll(async () => {
                        await beforeAllScenarioHook()
                    })
                    afterAll(async () => {
                        await afterAllScenarioHook()
                    })

                    const ruleDescribes: DescribesToRun = []

                    for (const ruleScenario of describeRuleScenarios) {
                        if (describeBackground) {
                            ruleDescribes.push(describeBackground)
                        }
                        if (describeRuleBackground) {
                            ruleDescribes.push(describeRuleBackground)
                        }
                        ruleDescribes.push(ruleScenario)
                    }

                    describe.each(
                        ruleDescribes.map((s) => {
                            return [s.describeTitle, s]
                        }),
                    )(`%s`, (_, { describeHandler }) => {
                        describeHandler()
                    })
                },
            })
        },
        BeforeEachScenario: (fn: () => MaybePromise) => {
            beforeEachScenarioHook = fn
        },
        BeforeAllScenarios: (fn: () => MaybePromise) => {
            beforeAllScenarioHook = fn
        },
        AfterAllScenarios: (fn: () => MaybePromise) => {
            afterAllScenarioHook = fn
        },
        AfterEachScenario: (fn: () => MaybePromise) => {
            afterEachScenarioHook = fn
        },
    }

    describeFeatureCallback(descibeFeatureParams)

    feature
        .checkUncalledRule(excludeTags)
        .checkUncalledScenario(excludeTags)
        .checkUncalledBackground(excludeTags)

    describe(feature.getTitle(), async () => {
        beforeAll(async () => {
            await beforeAllScenarioHook()
        })

        afterAll(async () => {
            await afterAllScenarioHook()
        })

        let everything: DescribesToRun = []

        for (const featureScenario of describeScenarios) {
            if (describeBackground) {
                everything.push(describeBackground)
            }

            everything.push(featureScenario)
        }

        everything = everything.concat(describeRules)

        describe.each(
            everything.map((s) => {
                return [s.describeTitle, s]
            }),
        )(`%s`, (_, { describeHandler }) => {
            describeHandler()
        })
    })
}
