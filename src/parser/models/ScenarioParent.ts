import {
    BackgroundNotCalledError,
    BackgroundNotExistsError,
    FeatureUknowScenarioError,
    IsScenarioOutlineError,
    NotScenarioOutlineError,
    ParentWithoutScenario,
    ScenarioNotCalledError,
} from '../../errors/errors'
import type { RequiredDescribeFeatureOptions } from '../../vitest/describe-feature'
import type { Background } from './Background'
import { Taggable } from './Taggable'
import { type Example, Scenario, ScenarioOutline } from './scenario'

export abstract class ScenarioParent extends Taggable {
    public readonly name: string

    public readonly scenarii: Scenario[] = []

    public background: Background | null = null

    protected readonly title: string

    protected constructor(name: string, title: string) {
        super()
        this.name = name
        this.title = title
    }

    public getScenarioByName(
        name: string,
    ): Scenario | ScenarioOutline | undefined {
        return this.scenarii.find((s: Scenario) => {
            return s.description === name
        })
    }

    public getScenarioExample(name: string): Example | null {
        const scenario = this.getScenarioByName(name)

        if (scenario instanceof ScenarioOutline) {
            return scenario.examples
        }

        return null
    }

    public getFirstNotCalledScenario(
        options: RequiredDescribeFeatureOptions,
    ): Scenario | ScenarioOutline | undefined {
        return this.scenarii.find((scenario: Scenario) => {
            return (
                scenario.isCalled === false &&
                (options.includeTags.length <= 0 ||
                    scenario.matchTags(options.includeTags) === true) &&
                scenario.matchTags(options.excludeTags) === false
            )
        })
    }

    public haveAlreadyCalledScenario(): boolean {
        return (
            this.scenarii.filter(
                (scenario: Scenario) => scenario.isCalled === true,
            ).length > 0
        )
    }

    public getTitle(): string {
        return `${this.title}: ${this.name}`
    }

    public checkUncalledScenario(options: RequiredDescribeFeatureOptions) {
        const uncalled = this.getFirstNotCalledScenario(options)

        if (uncalled) {
            throw new ScenarioNotCalledError(uncalled)
        }

        return this
    }

    public checkUncalledBackground(options: RequiredDescribeFeatureOptions) {
        if (this.background) {
            if (
                this.background.isCalled === false &&
                (options.includeTags.length <= 0 ||
                    this.background.matchTags(options.includeTags) === true) &&
                this.background.matchTags(options.excludeTags) === false
            ) {
                throw new BackgroundNotCalledError(this.background)
            }
        }

        return this
    }

    public getBackground(): Background {
        if (this.background) {
            return this.background
        }

        throw new BackgroundNotExistsError(this)
    }

    private checkIfScenarioExists(scenarioDescription: string): Scenario {
        const foundScenario = this.getScenarioByName(scenarioDescription)

        if (!foundScenario) {
            throw new FeatureUknowScenarioError(
                this,
                new Scenario(scenarioDescription),
            )
        }

        return foundScenario
    }

    private scenarioShouldNotBeOutline(scenario: Scenario) {
        if (scenario instanceof ScenarioOutline) {
            throw new IsScenarioOutlineError(scenario)
        }
    }

    private scenarioShouldBeOutline(scenario: Scenario) {
        if (!(scenario instanceof ScenarioOutline)) {
            throw new NotScenarioOutlineError(scenario)
        }
    }

    public getScenario(description: string): Scenario {
        const scenario = this.checkIfScenarioExists(description)

        this.scenarioShouldNotBeOutline(scenario)

        return scenario
    }

    public getScenarioOutline(description: string): ScenarioOutline {
        const scenario = this.checkIfScenarioExists(
            description,
        ) as ScenarioOutline

        this.scenarioShouldBeOutline(scenario)

        return scenario
    }

    public mustHaveScenario() {
        if (this.scenarii.length === 0) {
            throw new ParentWithoutScenario(this)
        }
    }
}
