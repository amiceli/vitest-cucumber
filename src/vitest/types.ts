export type StepCallbackDefinition = (name : string, fn : () => void | Promise<void>) => void

export type StepTest = {
    Given : StepCallbackDefinition
    When : StepCallbackDefinition
    But : StepCallbackDefinition
    And : StepCallbackDefinition
    Then : StepCallbackDefinition
}

export type ScenarioTest = (
    name : string, 
    fn : (options : StepTest) => void
) => void

export type MaybePromise<T = void> = T | Promise<T>