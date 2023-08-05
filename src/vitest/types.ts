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

export type FeatureDescribeCallback = (
    scenarioCallback: { Scenario: ScenarioTest }
) => MaybePromise

export type ScenarioTest = (
    scenarioDescription : string, 
    fn : (options : StepTest) => MaybePromise
) => void

