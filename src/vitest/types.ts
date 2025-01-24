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

export type StepTest = {
    Given: StepCallbackDefinition
    When: StepCallbackDefinition
    But: StepCallbackDefinition
    And: StepCallbackDefinition
    Then: StepCallbackDefinition
}

export type FeatureDescriibeCallbackParams = {
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
    Rule: RuleTest
}

export type DescribeFeatureCallback = (
    scenarioCallback: FeatureDescriibeCallbackParams,
) => void

export type RuleOptions = {
    RuleBackground: BackgroundTest
    RuleScenario: ScenarioTest
    RuleScenarioOutline: ScenarioOutlineTest
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

export type BackgroundStepTest = Pick<StepTest, 'Given' | 'And'>

export type BackgroundTest = (
    fn: (options: BackgroundStepTest) => MaybePromise,
) => void
