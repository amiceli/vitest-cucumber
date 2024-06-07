import { Rule } from '../parser/Rule'
import { ScenarioParent } from '../parser/ScenarioParent'
import { StepAble } from '../parser/Stepable'
import { Feature } from '../parser/feature'
import { Scenario, ScenarioOutline } from '../parser/scenario'
import { Step, StepTypes } from '../parser/step'

abstract class VitestsCucumberError extends Error {

    protected constructor (message: string) {
        super(message)

        this.stack = ``
        this.name = this.constructor.name
    }

}

export class NotScenarioOutlineError extends VitestsCucumberError {

    public constructor (scenario : Scenario) {
        super(`${scenario.getTitle()} is not a ScenarioOutline`)
    }

}

export class IsScenarioOutlineError extends VitestsCucumberError {

    public constructor (scenario : Scenario) {
        super(`${scenario.getTitle()} is a ScenarioOutline`)
    }

}

export class ScenarioNotCalledError extends VitestsCucumberError {

    public constructor (scenario: Scenario) {
        super(`${scenario.getTitle()} was not called`)
    }

}

export class ScenarioOutlineVariableNotCalledInStepsError extends VitestsCucumberError {

    public constructor (scenario : ScenarioOutline, variableName : string) {
        super(`${scenario.getTitle()} \n ${variableName} was not called in steps`)
    }

}

export class ScenarioOulineWithoutExamplesError extends VitestsCucumberError {

    public constructor (scenario : ScenarioOutline) {
        super(`${scenario.getTitle()} \n has an empty Examples`)
    }

}

export class ScenarioOutlineVariablesDeclaredWithoutExamplesError extends VitestsCucumberError {

    public constructor (scenario : ScenarioOutline) {
        super(`${scenario.getTitle()} \n variables declarated without Examples`)
    }

}

export class MissingScenarioOutlineVariableValueError extends VitestsCucumberError {

    public constructor (scenario : ScenarioOutline, variableName : string) {
        super(`${scenario.getTitle()} \n missing ${variableName} value in Excamples`)
    }

}

export class FeatureUknowScenarioError extends VitestsCucumberError {

    public constructor (feature : ScenarioParent, scenario : Scenario) {
        super(`${scenario.getTitle()} doesn't exist in \n Feature: ${feature.name}`)
    }

}

export class HookCalledAfterScenarioError extends VitestsCucumberError {

    public constructor (feature : ScenarioParent, hookName : string) {
        super(`${feature.getTitle()} \n ${hookName} hook was called after Scenario()`)
    }

}

export class StepAbleUnknowStepError extends VitestsCucumberError {

    public constructor (stepable : StepAble, step : Step) {
        super(`${stepable.getTitle()} \n ${step.type} ${step.details} doesn't exist`)
    }

}

export class StepAbleStepsNotCalledError extends VitestsCucumberError {

    public constructor (stepable : StepAble) {
        const steps = stepable
            .getNoCalledSteps()
            .map((s: Step) =>  `\n ${s.type} ${s.details} was not called`)
            .join(``)

        super(`${stepable.getTitle()}  ${steps}`)
    }

}

// for rules

export class RuleNotCalledError extends VitestsCucumberError {

    public constructor (rule : Rule) {
        super(`${rule.getTitle()} was not called`)
    }

}

export class FeatureUknowRuleError extends VitestsCucumberError {

    public constructor (feature : Feature, rule : Rule) {
        super(`${rule.getTitle()} doesn't exist in \n Feature: ${feature.name}`)
    }

}

export class HookCalledAfterRuleError extends VitestsCucumberError {

    public constructor (feature : Feature, hookName : string) {
        super(`${feature.getTitle()} \n ${hookName} hook was called after Rule()`)
    }

}

export class FeatureFileNotFoundError extends VitestsCucumberError {

    public constructor (path : string) {
        super(`feature file ${path} doesn't exist`)
    }

}

export class NotAllowedBackgroundStepTypeError extends VitestsCucumberError {

    public constructor (type : StepTypes) {
        super(`${type} step isn't allow in Background`)
    }

}

export class TwiceBackgroundError extends VitestsCucumberError {

    public constructor () {
        super(`A background already exists`)
    }

}

export class BackgroundNotExistsError extends VitestsCucumberError {

    public constructor (parent: ScenarioParent) {
        super(`${parent.getTitle()} hasn't background`)
    }

}

export class OnlyOneFeatureError extends VitestsCucumberError {

    public constructor () {
        super(`Gherkin rule: only one Feature by file`)
    }

}