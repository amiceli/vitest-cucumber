import chalk from "chalk"
import { Step } from "../parser/step"
import { test } from 'vitest'
import { Scenario } from "../parser/scenario"

export function scenarioDoestNotExist(scenarioName: string) {
    test.fails(
        chalk.red(`Scenario: ${chalk.bold(scenarioName)} doesn't exist in Feature`)
    )
}

export function stepDoesNotExist(name: string, title: string) {
    test.fails(
        chalk.red(
            `${name} ${chalk.bold(title)} doesn't exist in your Scenario`
        )
    )
}

export function stepIsNoCalled(step: Step) {
    test.fails(
        chalk.red(`${chalk.bold(step.name)} ${step.title} was not called`)
    )
}

export function displayNoCalledStepsError(scenario: Scenario): string {
    return [
        '\n',
        ...scenario
            .getNoCalledSteps()
            .map((s: Step) => {
                return `${s.name} ${s.title} not called`
            })
    ].join('\n')
}