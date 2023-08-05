import { Step } from "../parser/step"
import { Scenario } from "../parser/scenario"

export function scenarioDoestNotExist (scenarioName: string) {
    throw `Scenario: ${scenarioName} doesn't exist in your Feature`
}

export function stepDoesNotExist (name: string, title: string) {
    throw `${name} ${title} doesn't exist in your Scenario`
}

export function stepIsNoCalled (step: Step) {
    throw `${step.type} ${step.details} was not called`
}

export function displayNoCalledStepsError (scenario: Scenario): string {
    return [
        `\n`,
        ...scenario
            .getNoCalledSteps()
            .map((s: Step) => `${s.type} ${s.details} was not called` ),
    ].join(`\n`)
}