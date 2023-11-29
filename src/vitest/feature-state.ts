import { Step } from "../parser/step"
import { Scenario, ScenarioOutline } from "../parser/scenario"
import { Feature } from "../parser/feature"

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
            throw `Scenario: ${noCalledScenario.description} was not called`
        }
    }

    public checkIfScenarioExists (scenarioDescription: string) {
        const foundScenario = this.feature.getScenarioByName(scenarioDescription)

        if (!foundScenario) {
            throw `Scenario: ${scenarioDescription} doesn't exist in your Feature`
        }

        return foundScenario
    }

    public alreadyCalledScenarioAtStart (hook : string) {
        if (this.feature.haveAlreadyCalledScenario()) {
            throw `${hook}() should be called before Scenario()`
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

    public checkIfStepExists (stepType: string, stepDetails: string, scenarioDescription : string) {
        const foundStep = this.scenario.findStepByTypeAndDetails(
            stepType, stepDetails,
        )

        if (!foundStep) {
            throw `${stepType} ${stepDetails} doesn't exist in your Scenario:${scenarioDescription}`
        }

        return foundStep
    }

    public checkIfStepWasCalled () {
        if (this.scenario.hasUnCalledSteps()) {
            const errorMessage = [
                `\n`,
                ...this.scenario
                    .getNoCalledSteps()
                    .map((s: Step) => `${s.type} ${s.details} was not called`),
            ].join(`\n`)

            throw errorMessage
        }
    }

    public checkExemples () {
        if (this.scenario instanceof ScenarioOutline) {
            const { examples } = this.scenario
            const examplesKeys = Object.keys(examples)
            const stepsDetails = this.scenario.steps
                .map((s) => s.details)

            const missingVariables = examplesKeys.find((v) => {
                return stepsDetails.filter((s) => s.includes(v)).length === 0
            })

            if (missingVariables) {
                throw new Error(`ScenarioOutline: ${this.scenario.description} missing ${missingVariables} in step`)
            }

            if (examplesKeys.length === 0) {
                throw `ScenarioOutline: ${this.scenario.description} has no examples`
            }
        }
    }

}