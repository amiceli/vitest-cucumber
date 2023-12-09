import { Feature } from '../parser/feature'
import { Scenario, ScenarioOutline } from '../parser/scenario'

export class NotScenarioOutlineError extends Error {

    public constructor (scenario : Scenario) {
        super(`Scenario:${scenario.description} is not a ScenarioOutline`)
    }

}

export class IsScenarioOutlineError extends Error {

    public constructor (scenario : Scenario) {
        super(`Scenario:${scenario.description} is a ScenarioOutline`)
    }

}

export class ScenarioNotCalledError extends Error {

    public constructor (scenario : Scenario | ScenarioOutline) {
        if (scenario instanceof ScenarioOutline) {
            super(`ScenarioOutline: ${scenario.description} was not called`)
        } else {
            super(`Scenario: ${scenario.description} was not called`)
        }
    }

}

export class ScenarioOutlineVariableNotCalledInStepsError extends Error {

    public constructor (scenario : ScenarioOutline, variableName : string) {
        super(`ScenarioOutline:${scenario.description} \n ${variableName} was not called in steps`)
    }

}

export class ScenarioOulineWithoutExamplesError extends Error {

    public constructor (scenario : ScenarioOutline) {
        super(`ScenarioOutline:${scenario.description} \n has no examples`)
    }

}

export class MissingScenarioOutlineVariableValueError extends Error {

    public constructor (scenario : ScenarioOutline, variableName : string) {
        super(`ScenarioOutline:${scenario.description} \n missing ${variableName} value in Excamples`)
    }

}

export class FeatureUknowScenarioError extends Error {

    public constructor (feature : Feature, scenario : Scenario) {
        super(`Scenario: ${scenario.description} doesn't exist in \n Feature: ${feature.name}`)
    }

}

export class HookCalledAfterScenarioError extends Error {

    public constructor (feature : Feature, hookName : string) {
        super(`Feature: ${feature.name} \n ${hookName} hook was called after Scenario()`)
    }

}