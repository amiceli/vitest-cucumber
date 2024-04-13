import {
    StepAbleUnknowStepError, StepAbleStepsNotCalledError, ScenarioOulineWithoutExamplesError, ScenarioOutlineVariableNotCalledInStepsError, MissingScenarioOutlineVariableValueError, ScenarioOutlineVariablesDeclaredWithoutExamplesError,
} from "../../errors/errors"
import { StepAble } from "../../parser/Stepable"
import { ScenarioOutline } from "../../parser/scenario"
import { Step, StepTypes } from "../../parser/step"

export class ScenarioStateDetector {

    private readonly scenario: StepAble

    private constructor (scenario: StepAble) {
        this.scenario = scenario
    }

    public static forScenario (scenario: StepAble) {
        return new ScenarioStateDetector(scenario)
    }

    public checkIfStepExists (stepType: string, stepDetails: string) {
        const foundStep = this.scenario.findStepByTypeAndDetails(
            stepType, stepDetails,
        )

        if (!foundStep) {
            throw new StepAbleUnknowStepError(
                this.scenario,
                new Step(stepType as StepTypes, stepDetails),
            )
        }

        return foundStep
    }

    public checkIfStepWasCalled () {
        if (this.scenario.hasUnCalledSteps()) {
            throw new StepAbleStepsNotCalledError(
                this.scenario,
            )
        }
    }

    private checkIfScenarioHasNoExample () {
        const { examples } = this.scenario as ScenarioOutline

        if (examples.length === 0) {
            throw new ScenarioOulineWithoutExamplesError(this.scenario as ScenarioOutline)
        }
    }

    private detectMissingVariableInSteps () {
        const { examples } = this.scenario as ScenarioOutline
        const examplesKeys = Object.keys(examples[0])
        const missingVariable = examplesKeys.find((v) => {
            return this.scenario.steps
                .map((s) => s.details).join(``)
                .includes(`<${v}>`) === false
        })

        if (missingVariable) {
            throw new ScenarioOutlineVariableNotCalledInStepsError(
                this.scenario as ScenarioOutline,
                missingVariable,
            )
        }
    }

    private detectMissingVariableValue () {
        const { examples } = this.scenario as ScenarioOutline
        const examplesKeys = Object.keys(examples[0])

        const missingVariable = examplesKeys.find((v) => {
            return examples.filter((values) => {
                return values[v] === undefined || values[v] === null
            }).length > 0
        })

        if (missingVariable) {
            throw new MissingScenarioOutlineVariableValueError(
                this.scenario as ScenarioOutline,
                missingVariable,
            )
        }
    }

    public checkExemples () {
        if (this.scenario instanceof ScenarioOutline) {
            if (this.scenario.missingExamplesKeyword) {
                throw new ScenarioOutlineVariablesDeclaredWithoutExamplesError(
                    this.scenario as ScenarioOutline,
                )
            }
            this.checkIfScenarioHasNoExample()
            this.detectMissingVariableInSteps()
            this.detectMissingVariableValue()
        }
    }

}