import { Rule } from '../parser/Rule'
import { ScenarioParent } from '../parser/ScenarioParent'
import { Feature } from '../parser/feature'
import { Scenario, ScenarioOutline } from '../parser/scenario'
import { Step, StepTypes } from '../parser/step'

export class NotScenarioOutlineError extends Error {

    public constructor (scenario : Scenario) {
        super(`Scenario: ${scenario.description} is not a ScenarioOutline`)
    }

}

export class IsScenarioOutlineError extends Error {

    public constructor (scenario : Scenario) {
        super(`Scenario: ${scenario.description} is a ScenarioOutline`)
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
        super(`ScenarioOutline: ${scenario.description} \n ${variableName} was not called in steps`)
    }

}

export class ScenarioOulineWithoutExamplesError extends Error {

    public constructor (scenario : ScenarioOutline) {
        super(`ScenarioOutline: ${scenario.description} \n has an empty Examples`)
    }

}

export class ScenarioOutlineVariablesDeclaredWithoutExamplesError extends Error {

    public constructor (scenario : ScenarioOutline) {
        super(`ScenarioOutline: ${scenario.description} \n variables declarated without Examples`)
    }

}

export class MissingScenarioOutlineVariableValueError extends Error {

    public constructor (scenario : ScenarioOutline, variableName : string) {
        super(`ScenarioOutline: ${scenario.description} \n missing ${variableName} value in Excamples`)
    }

}

export class FeatureUknowScenarioError extends Error {

    public constructor (feature : ScenarioParent, scenario : Scenario) {
        super(`Scenario: ${scenario.description} doesn't exist in \n Feature: ${feature.name}`)
    }

}

export class HookCalledAfterScenarioError extends Error {

    public constructor (feature : ScenarioParent, hookName : string) {
        super(`Feature: ${feature.name} \n ${hookName} hook was called after Scenario()`)
    }

}

export class ScenarioUnknowStepError extends Error {

    public constructor (scenario : Scenario, step : Step) {
        super(`Scenario: ${scenario.description} \n ${step.type} ${step.details} doesn't exist`)
    }

}

export class ScenarioStepsNotCalledError extends Error {

    public constructor (scenario : Scenario) {
        const steps = scenario
            .getNoCalledSteps()
            .map((s: Step) =>  `\n ${s.type} ${s.details} was not called`)
            .join(``)

        super(`Scenario: ${scenario.description}  ${steps}`)
    }

}

// for rules

export class RuleNotCalledError extends Error {

    public constructor (rule : Rule) {
        super(`Rule: ${rule.name} was not called`)
    }

}

export class FeatureUknowRuleError extends Error {

    public constructor (feature : Feature, rule : Rule) {
        super(`Rule: ${rule.name} doesn't exist in \n Feature: ${feature.name}`)
    }

}

export class HookCalledAfterRuleError extends Error {

    public constructor (feature : Feature, hookName : string) {
        super(`Feature: ${feature.name} \n ${hookName} hook was called after Rule()`)
    }

}

export class FeatureFileNotFoundError extends Error {

    public constructor (path : string) {
        super(`feature file ${path} doesn't exist`)
    }

}

export class NotAllowedBackgroundStepTypeError extends Error {

    public constructor (type : StepTypes) {
        super(`${type} step isn't allow in Background`)
    }

}
