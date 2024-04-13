import { Example } from "../parser/scenario"

export type MaybePromise<T = void> = T | Promise<T>

export type StepCallbackDefinition = (
    name : string, 
    fn : () => MaybePromise
) => void

export type StepTest = {
    Given : StepCallbackDefinition
    When : StepCallbackDefinition
    But : StepCallbackDefinition
    And : StepCallbackDefinition
    Then : StepCallbackDefinition
}

export type FeatureDescriibeCallbackParams = { 
    Background: BackgroundTest,
    Scenario: ScenarioTest,
    ScenarioOutline: ScenarioOutlineTest,
    BeforeAllScenarios : (fn : () => MaybePromise) => void
    AfterAllScenarios : (fn : () => MaybePromise) => void
    BeforeEachScenario : (fn : () => MaybePromise) => void
    AfterEachScenario : (fn : () => MaybePromise) => void
    Rule : RuleTest
}

export type FeatureDescribeCallback = (
    scenarioCallback: FeatureDescriibeCallbackParams
) => MaybePromise

export type RuleOptions = {
    RuleBackground: BackgroundTest,
    RuleScenario: ScenarioTest,
    RuleScenarioOutline: ScenarioOutlineTest,
}

export type RuleTest = (
    ruleName : string,
    fn : (options :  RuleOptions) => MaybePromise
) => void

export type ScenarioTest = (
    scenarioDescription : string, 
    fn : (options : StepTest) => MaybePromise
) => void

export type ScenarioOutlineTest = (
    scenarioDescription : string, 
    fn : (options : StepTest, examples : Example[0]) => MaybePromise
) => void

export type BackgroundStepTest = Pick<StepTest, 'Given' | 'And'>

export type BackgroundTest = (
    fn : (options : BackgroundStepTest) => MaybePromise
) => void

