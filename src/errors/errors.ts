import { Background } from '../parser/Background'
import { Rule } from '../parser/Rule'
import { ScenarioParent } from '../parser/ScenarioParent'
import { StepAble } from '../parser/Stepable'
import { Feature } from '../parser/feature'
import { Scenario, ScenarioOutline } from '../parser/scenario'
import { Step, StepTypes } from '../parser/step'
import chalk from 'chalk'

abstract class VitestCucumberError extends Error {

    public constructor (message: string | string[]) {
        if (Array.isArray(message)) {
            super(message.join(`\n`))
        } else {
            super(message)
        }

        this.stack = ``
        this.name = this.constructor.name
    }

}

// steps

export class NotCalledStepError extends VitestCucumberError {

    public constructor (stepable: StepAble, notCalledSteps : Step[]) {
        super(
            [
                `${notCalledSteps.length} step(s) wasn't called`,
                `${chalk.reset(stepable.parent?.toString())}`,
                `    ${chalk.white(stepable.toString())}`,
                ...notCalledSteps.map((s) => `        ${s.toString()}`),
            ],
        )
    }

}

export class UnknowStepError extends VitestCucumberError {

    public constructor (stepable: StepAble, step: Step) {
        super([
            `Unknow called step in this ${stepable.constructor.name}`,
            `${chalk.reset(stepable.parent?.toString())}`,
            `    ${chalk.white(stepable.toString())}`,
            `        ${step.toString()}`,
        ])
    }

}

// Scenario

export class NotScenarioOutlineError extends VitestCucumberError {

    public constructor (scenario : Scenario) {
        super([
            `Scenario type mismatch`,
            chalk.white(`${scenario.parent?.toString()}`),
            `   ${(new ScenarioOutline(scenario.description)).toString()}`,
        ])
    }

}

export class IsScenarioOutlineError extends VitestCucumberError {

    public constructor (scenario : Scenario) {
        super([
            `Scenario type mismatch`,
            chalk.white(`${scenario.parent?.toString()}`),
            `   ${(new Scenario(scenario.description)).toString()}`,
        ])
    }

}

export class ScenarioNotCalledError extends VitestCucumberError {

    public constructor (scenario : StepAble) {
        super([
            `Scenario not called`,
            chalk.white(`${scenario.parent?.toString()}`),
            `   ${scenario.toString()}`,
        ])
    }

}

// Background

export class BackgroundNotExistsError extends VitestCucumberError {

    public constructor (parent: ScenarioParent) {
        super(`${parent.toString()} hasn't background`)
    }

}

export class TwiceBackgroundError extends VitestCucumberError {

    public constructor (background : Background) {
        super([
            `More than one Background is forbidden.`,
            `Two backgrouns found in :`,
            chalk.white(`    ${background.parent?.toString()}`),
        ])
    }

}

// 

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
