import { Feature } from "../parser/feature"
import { FeatureFileReader } from "../parser/readfile"
import { it, describe, expect, test } from 'vitest'
import { Scenario } from "../parser/scenario"
import { Step, stepNames } from "../parser/step"
import chalk from 'chalk'
import {
    featureDescribe,
    scenarioSteps
} from './types'

class FeatureTest {

    private readonly feature: Feature

    public constructor(feature: Feature) {
        this.feature = feature
    }

    public Scenario(title: string, feature: Feature, fn: Function) {
        const found = feature.scenarii.filter((s: Scenario) => {
            return s.name === title
        })

        if (found.length > 0) {
            const scenario = found[0]
            const describeScenarioTitle = `${chalk.blue('Scenario:')}: ${title}`
            const scenarioSteps : scenarioSteps = {
                Given: (title: string, testFn: Function) => {
                    this.ScenarioStep(stepNames.GIVEN, title, scenario, testFn)
                },
                When: (title: string, testFn: Function) => {
                    this.ScenarioStep(stepNames.WHEN, title, scenario, testFn)
                },
                And: (title: string, testFn: Function) => {
                    this.ScenarioStep(stepNames.AND, title, scenario, testFn)
                },
                Then: (title: string, testFn: Function) => {
                    this.ScenarioStep(stepNames.THEN, title, scenario, testFn)
                }
            }

            scenario.isCalled = true

            describe(
                describeScenarioTitle,
                async () => {
                    await fn(scenarioSteps)
                }
            ).on('afterAll', () => {
                scenario
                    .steps
                    .filter((s : Step) => !s.isCalled)
                    .forEach((s : Step) => {
                        expect.fail(
                            `\n    Scenario: ${scenario.name}\n        ${s.name} ${chalk.italic(s.title)} should be called`,
                        )
                    })
            })
        } else {
            const message = `${chalk.bold('Scenario:')} ${chalk.italic(title)} doesn't exist in this feature`
            test.fails(chalk.red(message))
        }
    }

    public ScenarioStep(key: stepNames, title: string, scenario: Scenario, fn: Function) {
        const foundSteps = scenario.steps.filter((s: Step) => {
            return s.name === key && s.title === title
        })

        if (foundSteps.length > 0) {
            const stepTitle = chalk.green(chalk.bold(key))
            const [currentStep] = foundSteps

            currentStep.isCalled = true

            it(`${stepTitle} ${title}`, async () => {
                await fn()
            })
        } else {
            const message = `No ${chalk.bold(key)} ${title}`
            test.fails(chalk.red(message))
        }
    }

    public describe(line: string, fn: featureDescribe) {
        if (this.feature.name === line) {
            const describeTitle = `${chalk.blue('Feature:')} ${line}`
            const descibeFeatureParams = {
                Scenario: (title: string, scenarFn: Function) => {
                    this.Scenario(title, this.feature, scenarFn)
                }
            }
            const describeFeatureCallback = async () => {
                await fn( descibeFeatureParams )
            }

            describe(
                describeTitle,
                describeFeatureCallback,
            ).on('afterAll', () => {
                this.detectUnTestedScenarios()
            })
        } else {
            const message = 'Incorrect feature title'
            test.fails(message)
        }
    }

    private detectUnTestedScenarios () {
        this.feature.scenarii.forEach((s: Scenario) => {
            const expectMessage = `\n  Scenario:  ${chalk.bold(s.name)} should be tested\n`
            
            expect( s.isCalled, expectMessage ).toBeTruthy()
        })
    }
}

export async function initializeFeature(path: string) {
    const feature = await FeatureFileReader
        .fromPath(path)
        .parseFile()

    return new FeatureTest(feature[0])
}