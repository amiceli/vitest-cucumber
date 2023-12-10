import { Step, StepTypes } from "../parser/step"
import { Scenario, ScenarioOutline } from "../parser/scenario"
import { Feature } from "../parser/feature"
import {
    FeatureUknowScenarioError,
    HookCalledAfterScenarioError,
    MissingScenarioOutlineVariableValueError, ScenarioNotCalledError, ScenarioOulineWithoutExamplesError, ScenarioOutlineVariableNotCalledInStepsError, ScenarioOutlineVariablesDeclaredWithoutExamplesError, ScenarioStepsNotCalledError, ScenarioUnknowStepError, 
} from "../errors/errors"

export class FeatureStateDetector {

    private readonly feature: Feature

    private constructor (feature: Feature) {
        this.feature = feature
    }

    public static forFeature (feature: Feature) {
        return new FeatureStateDetector(feature)
    }

    public checkNotCalledScenario () {
        const noCalledScenario = this.feature.getFirstNotCalledScenario()

        if (noCalledScenario) {
            throw new ScenarioNotCalledError(noCalledScenario)
        }
    }

    public checkIfScenarioExists (scenarioDescription: string) {
        const foundScenario = this.feature.getScenarioByName(scenarioDescription)

        if (!foundScenario) {
            throw new FeatureUknowScenarioError(
                this.feature,
                new Scenario(scenarioDescription),
            )
        }

        return foundScenario
    }

    public alreadyCalledScenarioAtStart (hook: string) { // A tester
        if (this.feature.haveAlreadyCalledScenario()) {
            throw new HookCalledAfterScenarioError(
                this.feature,
                hook,
            )
        }
    }

}

export class ScenarioStateDetector {

    private readonly scenario: Scenario

    private constructor (scenario: Scenario) {
        this.scenario = scenario
    }

    public static forScenario (scenario: Scenario) {
        return new ScenarioStateDetector(scenario)
    }

    public checkIfStepExists (stepType: string, stepDetails: string) {
        const foundStep = this.scenario.findStepByTypeAndDetails(
            stepType, stepDetails,
        )

        if (!foundStep) {
            throw new ScenarioUnknowStepError(
                this.scenario,
                new Step(stepType as StepTypes, stepDetails),
            )
        }

        return foundStep
    }

    public checkIfStepWasCalled () {
        if (this.scenario.hasUnCalledSteps()) {
            throw new ScenarioStepsNotCalledError(
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