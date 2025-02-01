import type { TaskContext } from 'vitest'
import type { Example } from '../parser/models/scenario'

export type MaybePromise<T = void> = T | Promise<T>

export type CallbackWithSingleContext = (context: TaskContext) => MaybePromise

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type CallbackWithParamsAndContext<T = any> = (
    ctx: TaskContext,
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

type DefineStepsHandler = (
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
    defineSteps: DefineStepsHandler
    context: T
}

export type DescribeFeatureCallback = (
    scenarioCallback: FeatureDescriibeCallbackParams,
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
