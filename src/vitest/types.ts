import type { TestContext } from 'vitest'
import type { Example } from '../parser/models/scenario'

export type MaybePromise<T = void> = T | Promise<T>

export type CallbackWithSingleContext = (context: TestContext) => MaybePromise

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type CallbackWithParamsAndContext<T = any> = (
    ctx: TestContext,
    ...params: T[]
) => MaybePromise

export type StepCallbackDefinition = (
    name: string,
    fn: CallbackWithSingleContext | CallbackWithParamsAndContext,
) => void

// biome-ignore lint/suspicious/noExplicitAny: required for scenario context type
export type StepTest<T = any> = {
    Given: StepCallbackDefinition
    When: StepCallbackDefinition
    But: StepCallbackDefinition
    And: StepCallbackDefinition
    Then: StepCallbackDefinition
    context: T
}

export type DefineStepsHandler = (
    callback: (defineStepsOptions: {
        Given: StepCallbackDefinition
        When: StepCallbackDefinition
        Then: StepCallbackDefinition
        And: StepCallbackDefinition
        But: StepCallbackDefinition
    }) => void,
) => void

// biome-ignore lint/suspicious/noExplicitAny: required for feature context type
export type FeatureDescriibeCallbackParams<T = any> = {
    Background: BackgroundTest & {
        skip: BackgroundTest
    }
    Scenario: ScenarioTest & {
        skip: ScenarioTest
        only: ScenarioTest
    }
    ScenarioOutline: ScenarioOutlineTest & {
        skip: ScenarioOutlineTest
        only: ScenarioOutlineTest
    }
    BeforeAllScenarios: (fn: () => MaybePromise) => void
    AfterAllScenarios: (fn: () => MaybePromise) => void
    BeforeEachScenario: (fn: () => MaybePromise) => void
    AfterEachScenario: (fn: () => MaybePromise) => void
    Rule: RuleTest & {
        skip: RuleTest
        only: RuleTest
    }
    /** should be called before Scenario, Rule, ScenarioOutline or Background */
    defineSteps: DefineStepsHandler
    context: T
}

export type DescribeFeatureCallback = (
    scenarioCallback: FeatureDescriibeCallbackParams,
) => void

export type DefineFeatureRuleTest = (
    ruleName: string,
    fn: (options: Omit<RuleOptions, 'RuleScenarioOutline'>) => void,
) => void

export type DefineFeatureCallback = (
    scenarioCallback: Omit<
        FeatureDescriibeCallbackParams,
        'ScenarioOutline'
    > & {
        Rule: DefineFeatureRuleTest & {
            skip: DefineFeatureRuleTest
            only: DefineFeatureRuleTest
        }
    },
) => void

// biome-ignore lint/suspicious/noExplicitAny: required for rule context type
export type RuleOptions<T = any> = {
    RuleBackground: BackgroundTest & {
        skip: BackgroundTest
    }
    RuleScenario: ScenarioTest & {
        skip: ScenarioTest
        only: ScenarioTest
    }
    RuleScenarioOutline: ScenarioOutlineTest & {
        skip: ScenarioOutlineTest
        only: ScenarioOutlineTest
    }
    /** should be called before RuleScenario, RuleScenarioOutline or RuleBackground */
    defineSteps: DefineStepsHandler
    context: T
}

export type RuleTest = (
    ruleName: string,
    fn: (options: RuleOptions) => void,
) => void

export type ScenarioTest = (
    scenarioDescription: string,
    fn: (options: StepTest) => MaybePromise,
) => void

export type ScenarioOutlineTest = (
    scenarioDescription: string,
    fn: (options: StepTest, examples: Example[0]) => MaybePromise,
) => void

export type BackgroundStepTest = Pick<StepTest, 'Given' | 'And' | 'context'>

export type BackgroundTest = (
    fn: (options: BackgroundStepTest) => MaybePromise,
) => void
