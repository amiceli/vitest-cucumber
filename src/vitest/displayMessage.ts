import chalk from "chalk"
import { Step } from "../parser/step"
import { Scenario } from "../parser/scenario"

export function scenarioDoestNotExist (scenarioName: string) {
    throw (
        chalk.red(`Scenario: ${scenarioName} doesn't exist in Feature`)
    )
}

export function stepDoesNotExist (name: string, title: string) {
    throw (
        chalk.red(
            `${name} ${title} doesn't exist in your Scenario`,
        )
    )
}

export function stepIsNoCalled (step: Step) {
    throw (
        chalk.red(`${step.name} ${step.title} was not called`)
    )
}

export function displayNoCalledStepsError (scenario: Scenario): string {
    return [
        `\n`,
        ...scenario
            .getNoCalledSteps()
            .map((s: Step) => {
                return `${s.name} ${s.title} not called`
            }),
    ].join(`\n`)
}