import { Step } from "../parser/step"
import { Scenario } from "../parser/scenario"
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

}