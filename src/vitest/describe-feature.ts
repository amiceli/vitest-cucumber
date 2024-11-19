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

type DescribesToRun = Array<{
    skipped: boolean
    describeTitle: string
    describeHandler: () => void
}>
type DescribesToRunOrSkip = {
    describeToRun: DescribesToRun
    describeToSkip: DescribesToRun
}

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

function defineRuleScenarioToRun(options: {
    describes: DescribesToRun
    ruleBackground: DescribesToRun[0] | null
    featureBackground: DescribesToRun[0] | null
}): DescribesToRunOrSkip {
    const describeToRun = options.describes.filter((d) => !d.skipped)
    const describeToSkip = options.describes.filter((d) => d.skipped)

    const finalDescribesToRun: DescribesToRun = []

    for (const toRun of describeToRun) {
        if (options.featureBackground) {
            finalDescribesToRun.push(options.featureBackground)
        }
        if (options.ruleBackground) {
            finalDescribesToRun.push(options.ruleBackground)
        }
        finalDescribesToRun.push(toRun)
    }

    return {
        describeToRun: finalDescribesToRun,
        describeToSkip,
    }
}

function defineScenarioToRun(options: {
    describes: DescribesToRun
    describeRules: DescribesToRun
    featureBackground: DescribesToRun[0] | null
}): DescribesToRunOrSkip {
    const describeToRun = options.describes.filter((d) => !d.skipped)
    const describeToSkip = options.describes.filter((d) => d.skipped)

    const finalDescribesToRun: DescribesToRun = []

    for (const toRun of describeToRun) {
        if (options.featureBackground) {
            finalDescribesToRun.push(options.featureBackground)
        }
        finalDescribesToRun.push(toRun)
    }

    describeToSkip.push(...options.describeRules.filter((s) => s.skipped))
    finalDescribesToRun.push(...options.describeRules.filter((s) => !s.skipped))

    return {
        describeToRun: finalDescribesToRun,
        describeToSkip,
    }
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
                skipped: background.matchTags(options.excludeTags),
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
                skipped: scenario.matchTags(options.excludeTags),
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
                    skipped: scenario.matchTags(options.excludeTags),
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
                        skipped: background.matchTags(options.excludeTags),
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
                        skipped: scenario.matchTags(options.excludeTags),
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
                            skipped: scenario.matchTags(options.excludeTags),
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
                skipped: currentRule.matchTags(options.excludeTags),
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

        const { describeToRun, describeToSkip } = defineScenarioToRun({
            describes: describeScenarios,
            featureBackground: describeBackground,
            describeRules,
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
    })
}
