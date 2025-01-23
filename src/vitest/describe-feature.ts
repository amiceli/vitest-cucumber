import { afterAll, beforeAll, describe } from 'vitest'
import type { Example, Feature } from '../parser/models'
import {
    type TagFilterItem,
    type VitestCucumberOptions,
    getVitestCucumberConfiguration,
} from './configuration'
import { createBackgroundDescribeHandler } from './describe/describeBackground'
import { createScenarioDescribeHandler } from './describe/describeScenario'
import { createScenarioOutlineDescribeHandler } from './describe/describeScenarioOutline'
import {
    type DescribesToRun,
    defineRuleScenarioToRun,
    defineScenarioToRun,
} from './describe/handle-skip-only'
import { ScenarioStateDetector } from './state-detectors/ScenarioStateDetector'
import type {
    BackgroundStepTest,
    DescribeFeatureCallback,
    FeatureDescriibeCallbackParams,
    MaybePromise,
    StepTest,
} from './types'

export type DescribeFeatureOptions = Pick<
    VitestCucumberOptions,
    'includeTags' | 'excludeTags'
>
export type RequiredDescribeFeatureOptions = Required<DescribeFeatureOptions>

/**
 * Extract tag filters by removing the `@` prefix if present
 */
const extractTagFilters = (filterItems: TagFilterItem[]): TagFilterItem[] => {
    return filterItems.map((filterItem) => {
        if (Array.isArray(filterItem)) {
            return extractTagFilters(filterItem) as TagFilterItem
        }

        if (filterItem.startsWith('@')) {
            return filterItem.replace('@', '') as TagFilterItem
        }

        return filterItem as TagFilterItem
    })
}

export function describeFeature(
    feature: Feature,
    describeFeatureCallback: DescribeFeatureCallback,
    describeFeatureOptions?: DescribeFeatureOptions,
) {
    let beforeAllScenarioHook: () => MaybePromise = () => {}
    let beforeEachScenarioHook: () => MaybePromise = () => {}
    let afterAllScenarioHook: () => MaybePromise = () => {}
    let afterEachScenarioHook: () => MaybePromise = () => {}

    const configuration = getVitestCucumberConfiguration()
    const options = {
        includeTags: extractTagFilters(
            describeFeatureOptions?.includeTags || configuration.includeTags,
        ),
        excludeTags: extractTagFilters(
            describeFeatureOptions?.excludeTags || configuration.excludeTags,
        ),
    }

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
                only: false,
                skipped: !background.shouldBeCalled(options),
                describeTitle: background.getTitle(),
                describeHandler: createBackgroundDescribeHandler({
                    background,
                    backgroundCallback,
                }),
            }
        },
        Scenario: (() => {
            const createScenarioHandler = (
                scenarioDescription: string,
                scenarioTestCallback: (op: StepTest) => MaybePromise,
                only: boolean,
                skipped?: boolean,
            ) => {
                const scenario = feature.getScenario(scenarioDescription)
                scenario.isCalled = true

                describeScenarios.push({
                    skipped: skipped ?? !scenario.shouldBeCalled(options),
                    only,
                    describeTitle: scenario.getTitle(),
                    describeHandler: createScenarioDescribeHandler({
                        scenario,
                        scenarioTestCallback,
                        beforeEachScenarioHook,
                        afterEachScenarioHook,
                    }),
                })
            }

            const fn = (
                scenarioDescription: string,
                scenarioTestCallback: (op: StepTest) => MaybePromise,
            ) =>
                createScenarioHandler(
                    scenarioDescription,
                    scenarioTestCallback,
                    false,
                )

            fn.skip = (
                scenarioDescription: string,
                scenarioTestCallback: (op: StepTest) => MaybePromise,
            ) =>
                createScenarioHandler(
                    scenarioDescription,
                    scenarioTestCallback,
                    false,
                    true,
                )

            fn.only = (
                scenarioDescription: string,
                scenarioTestCallback: (op: StepTest) => MaybePromise,
            ) =>
                createScenarioHandler(
                    scenarioDescription,
                    scenarioTestCallback,
                    true,
                    false,
                )

            return fn
        })(),
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
                    only: false,
                    skipped: !scenario.shouldBeCalled(options),
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
                        skipped: !background.shouldBeCalled(options),
                        only: false,
                        describeTitle: background.getTitle(),
                        describeHandler: createBackgroundDescribeHandler({
                            background: background,
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
                        skipped: !scenario.shouldBeCalled(options),
                        only: false,
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
                            skipped: !scenario.shouldBeCalled(options),
                            only: false,
                            describeTitle: scenario.getTitle(),
                            describeHandler: t,
                        })),
                    )
                },
            })

            currentRule
                .checkUncalledScenario(options)
                .checkUncalledBackground(options)

            describeRules.push({
                skipped: !currentRule.shouldBeCalled(options),
                only: false,
                describeTitle: currentRule.getTitle(),
                describeHandler: function describeRule() {
                    beforeAll(async () => {
                        await beforeAllScenarioHook()
                    })
                    afterAll(async () => {
                        await afterAllScenarioHook()
                    })

                    const { describeToRun, describeToSkip } =
                        defineRuleScenarioToRun({
                            describes: describeRuleScenarios,
                            ruleBackground: describeRuleBackground,
                            featureBackground: describeBackground,
                        })

                    describe.skip.each(
                        describeToSkip.map((s) => {
                            return [s.describeTitle, s]
                        }),
                    )(`%s`, (_, { describeHandler }) => {
                        describeHandler()
                    })

                    describe.each(
                        describeToRun.map((s) => {
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
        .checkUncalledRule(options)
        .checkUncalledScenario(options)
        .checkUncalledBackground(options)

    describe(feature.getTitle(), async () => {
        beforeAll(async () => {
            await beforeAllScenarioHook()
        })

        afterAll(async () => {
            await afterAllScenarioHook()
        })

        const { describeToRun, describeToSkip, onlyDescribeToRun } =
            defineScenarioToRun({
                describes: describeScenarios,
                featureBackground: describeBackground,
                describeRules,
            })

        describe.only.each(
            onlyDescribeToRun.map((s) => {
                return [s.describeTitle, s]
            }),
        )(`%s`, (_, { describeHandler }) => {
            describeHandler()
        })

        describe.skip.each(
            describeToSkip.map((s) => {
                return [s.describeTitle, s]
            }),
        )(`%s`, (_, { describeHandler }) => {
            describeHandler()
        })

        // )(`%s`, async ([, scenarioStep], ctx) => {
        describe.each(
            describeToRun.map((s) => {
                return [s.describeTitle, s]
            }),
        )(`%s`, (_, parent) => {
            parent.describeHandler()
        })
    })
}
