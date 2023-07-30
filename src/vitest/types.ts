export type scenarioStepFunction = (title: string, fn: Function) => Promise<void> | void

export type scenarioSteps = {
    Given: scenarioStepFunction
    When: scenarioStepFunction
    And: scenarioStepFunction
    Then: scenarioStepFunction
}

export type scenarioFunction = (
    title: string, 
    fn: (options: scenarioSteps) => Promise<void> | void
) => Promise<void> | void

export type featureDescribe = (options: { Scenario: scenarioFunction }) => Promise<void> | void