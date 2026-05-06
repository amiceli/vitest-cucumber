import { DefineFeature } from '../parser/models'
import type { DefineRule } from '../parser/models/Rule'
import type { Example } from '../parser/models/scenario'
import { describeFeature } from './describe-feature'
import type {
    DefineFeatureCallback,
    DescribeFeatureCallback,
    FeatureDescriibeCallbackParams,
    MaybePromise,
    RuleOptions,
    StepTest,
} from './types'

type ScenarioOutlineVariant = 'fn' | 'skip' | 'only'

function wrapScenarioOutline(
    target: FeatureDescriibeCallbackParams['ScenarioOutline'],
    register: (description: string, examples: Example) => void,
) {
    const build = (variant: ScenarioOutlineVariant) => {
        const fn = variant === 'fn' ? target : target[variant]

        return (
            description: string,
            cb: (op: StepTest, variables: Example[0]) => MaybePromise,
            examples: Example,
        ) => {
            register(description, examples)
            fn(description, cb)
        }
    }

    return Object.assign(build('fn'), {
        skip: build('skip'),
        only: build('only'),
    })
}

export function defineFeature(
    featureName: string,
    describeFeatureCallback: DefineFeatureCallback,
) {
    const feature = new DefineFeature(featureName, 'Feature', true)

    const wrappedCallback: DescribeFeatureCallback = (params) => {
        const wrappedScenarioOutline = wrapScenarioOutline(
            params.ScenarioOutline,
            (description, examples) =>
                feature.registerScenarioOutline(description, examples),
        )

        const originalRule = params.Rule

        const buildRule = (variant: ScenarioOutlineVariant) => {
            const target =
                variant === 'fn' ? originalRule : originalRule[variant]

            return (
                ruleName: string,
                ruleCallback: (options: RuleOptions) => void,
            ) => {
                target(ruleName, (ruleOptions) => {
                    const rule = feature.checkIfRuleExists(
                        ruleName,
                    ) as DefineRule

                    ruleCallback({
                        ...ruleOptions,
                        RuleScenarioOutline: wrapScenarioOutline(
                            ruleOptions.RuleScenarioOutline,
                            (description, examples) =>
                                rule.registerScenarioOutline(
                                    description,
                                    examples,
                                ),
                        ) as unknown as RuleOptions['RuleScenarioOutline'],
                    })
                })
            }
        }

        const wrappedRule = Object.assign(buildRule('fn'), {
            skip: buildRule('skip'),
            only: buildRule('only'),
        })

        ;(describeFeatureCallback as unknown as (p: unknown) => void)({
            ...params,
            ScenarioOutline: wrappedScenarioOutline,
            Rule: wrappedRule,
        })
    }

    return describeFeature(feature, wrappedCallback, {})
}
