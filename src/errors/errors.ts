import type { Background } from '../parser/models/Background'
import type { Rule } from '../parser/models/Rule'
import type { ScenarioParent } from '../parser/models/ScenarioParent'
import type { StepAble } from '../parser/models/Stepable'
import type { Feature } from '../parser/models/feature'
import type { Scenario, ScenarioOutline } from '../parser/models/scenario'
import type { Step, StepTypes } from '../parser/models/step'

export class VitestsCucumberError extends Error {
    public constructor(message: string, name?: string) {
        super(message)

        this.stack = ``
        this.name = name || this.constructor.name
    }
}

export class NotScenarioOutlineError extends VitestsCucumberError {
    public constructor(scenario: Scenario) {
        super(`${scenario.getTitle()} is not a ScenarioOutline`)
    }
}

export class IsScenarioOutlineError extends VitestsCucumberError {
    public constructor(scenario: Scenario) {
        super(`${scenario.getTitle()} is a ScenarioOutline`)
    }
}

export class BackgroundNotCalledError extends VitestsCucumberError {
    public constructor(background: Background) {
        super(`${background.getTitle()} was not called`)
    }
}

export class ScenarioNotCalledError extends VitestsCucumberError {
    public constructor(scenario: Scenario) {
        super(`${scenario.getTitle()} was not called`)
    }
}

export class ScenarioOutlineVariableNotCalledInStepsError extends VitestsCucumberError {
    public constructor(scenario: ScenarioOutline, variableName: string) {
        super(
            `${scenario.getTitle()} \n ${variableName} was not called in steps`,
        )
    }
}

export class ScenarioOulineWithoutExamplesError extends VitestsCucumberError {
    public constructor(scenario: ScenarioOutline) {
        super(`${scenario.getTitle()} \n has an empty Examples`)
    }
}

export class ScenarioOutlineVariablesDeclaredWithoutExamplesError extends VitestsCucumberError {
    public constructor(scenario: ScenarioOutline) {
        super(`${scenario.getTitle()} \n variables declarated without Examples`)
    }
}

export class MissingScenarioOutlineVariableValueError extends VitestsCucumberError {
    public constructor(scenario: ScenarioOutline, variableName: string) {
        super(
            `${scenario.getTitle()} \n missing ${variableName} value in Excamples`,
        )
    }
}

export class FeatureUknowScenarioError extends VitestsCucumberError {
    public constructor(feature: ScenarioParent, scenario: Scenario) {
        super(
            `${scenario.getTitle()} doesn't exist in \n ${feature.getTitle()}`,
        )
    }
}

export class StepAbleUnknowStepError extends VitestsCucumberError {
    public constructor(stepable: StepAble, step: Step) {
        super(
            `${stepable.getTitle()} \n ${step.type} ${step.details} doesn't exist`,
        )
    }
}

export class StepAbleStepExpressionError extends VitestsCucumberError {
    public constructor(stepable: StepAble, step: Step) {
        super(
            [
                `No step match with this expression`,
                `   ${stepable.getTitle()}`,
                `       ${step.getTitle()} ❌`,
            ].join(`\n`),
        )
    }
}

export class StepAbleStepsNotCalledError extends VitestsCucumberError {
    public constructor(stepable: StepAble, step: Step) {
        super(
            [
                ``,
                `    ${stepable.getTitle()}`,
                `        ${step.getTitle()} ❌`,
            ].join(`\n`),
            `Missing steps in Scenario`,
        )
    }
}

// for rules

export class RuleNotCalledError extends VitestsCucumberError {
    public constructor(rule: Rule) {
        super(`${rule.getTitle()} was not called`)
    }
}

export class FeatureUknowRuleError extends VitestsCucumberError {
    public constructor(feature: Feature, rule: Rule) {
        super(`${rule.getTitle()} doesn't exist in \n Feature: ${feature.name}`)
    }
}

export class FeatureFileNotFoundError extends VitestsCucumberError {
    public constructor(path: string) {
        super(`feature file ${path} doesn't exist`)
    }
}

export class NotAllowedBackgroundStepTypeError extends VitestsCucumberError {
    public constructor(type: StepTypes) {
        super(`${type} step isn't allow in Background`)
    }
}

export class TwiceBackgroundError extends VitestsCucumberError {
    public constructor() {
        super(`A background already exists`)
    }
}

export class BackgroundNotExistsError extends VitestsCucumberError {
    public constructor(parent: ScenarioParent) {
        super(`${parent.getTitle()} hasn't background`)
    }
}

export class OnlyOneFeatureError extends VitestsCucumberError {
    public constructor() {
        super(`Gherkin rule: only one Feature by file`)
    }
}

export class StepExpressionMatchError extends VitestsCucumberError {
    public constructor(step: Step, expression: string) {
        super(`${expression} no mtach with ${step.details}`)
    }
}

export class MissingFeature extends VitestsCucumberError {
    public constructor(line: string) {
        super(
            [
                `Missing Feature before add Scenario, Rule or Background`,
                `   ${line.trim()} ❌`,
            ].join('\n'),
        )
    }
}

export class MissingSteppableError extends VitestsCucumberError {
    public constructor(line: string) {
        super(
            [
                `Missing Scenario, ScenarioOutline or Background before add step`,
                `   ${line.trim()} ❌`,
            ].join('\n'),
        )
    }
}

export class MissingScnearioOutlineError extends VitestsCucumberError {
    public constructor(line: string) {
        super(
            [
                `Missing ScenarioOutline before add Examples`,
                `   ${line.trim()} ❌`,
            ].join('\n'),
        )
    }
}
export class MissingExamplesError extends VitestsCucumberError {
    public constructor(line: string) {
        super(
            [`Missing Examples before add value`, `   ${line.trim()} ❌`].join(
                '\n',
            ),
        )
    }
}
