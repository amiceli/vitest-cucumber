export type stepCallbackDefinition = (name : string, fn : () => void | Promise<void>) => void

export type StepTest = {
    Given : stepCallbackDefinition
    When : stepCallbackDefinition
    But : stepCallbackDefinition
    And : stepCallbackDefinition
    Then : stepCallbackDefinition
}

export type ScenarioTest = (
    name : string, 
    fn : (options : StepTest) => void
) => void

export type MaybePromise<T = void> = T | Promise<T>