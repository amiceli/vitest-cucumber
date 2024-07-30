import { GherkinParser } from "../parser"
import {
    describe, it, expect, beforeEach,
} from 'vitest'
import { StepTypes } from "../step"
import { ScenarioOutline } from "../scenario"
import { OnlyOneFeatureError, TwiceBackgroundError } from "../../errors/errors"
import { FeatureContentReader } from "../../__mocks__/FeatureContentReader.spec"
import { describeFeature } from "../../vitest/describe-feature"

describe(`GherkinParser`, () => {

    let parser : GherkinParser

    beforeEach(() => {
        parser = new GherkinParser()
    })

    function getCurrentFeaut (p: GherkinParser) {
        const { features } = p
        const [firstFeature] = features

        return firstFeature
    }

    function getCurrentScenario (p: GherkinParser) {
        const feature = getCurrentFeaut(p)
        const [scenario] = feature.scenarii

        return scenario
    }

    it(`should be able to parse Feature line`, () => {
        const featureTitle = `Awesome unit tests`

        parser.addLine(`Feature: ${featureTitle}`)

        const currentFeature = getCurrentFeaut(parser)

        expect(currentFeature).not.toBeUndefined()
        expect(currentFeature.name).toEqual(featureTitle)
        expect(currentFeature.scenarii.length).toEqual(0)
    })

    it(`should prevent more than one Feature`, () => {
        parser.addLine(`Feature: test`)

        expect(() => {
            parser.addLine(`Feature: another test`)
        }).toThrowError(
            new OnlyOneFeatureError(),
        )
    })

    it(`should be able to parse Scenario line`, () => {
        const scenarioTitile = `Run unit tests`

        parser.addLine(`Feature: awesome feature`)
        parser.addLine(`Scenario: ${scenarioTitile}`)
        parser.addLine(``)

        const currentFeature = getCurrentFeaut(parser)
        const currentScenario = getCurrentScenario(parser)

        expect(currentFeature.scenarii.length).toEqual(1)
        expect(currentScenario.description).toEqual(scenarioTitile)
        expect(currentScenario.steps.length).toEqual(0)
        expect(currentScenario.isCalled).toBeFalsy()
    })

    it(`should be able to parse Example line`, () => {
        parser.addLine(`Feature: awesome feature`)
        parser.addLine(`Example: Run unit tests`)
        parser.addLine(``)

        const currentFeature = getCurrentFeaut(parser)
        const currentScenario = getCurrentScenario(parser)

        expect(currentFeature.scenarii.length).toEqual(1)
        expect(currentScenario.description).toEqual(`Run unit tests`)
    })

    it(`should be able to parse Given line`, () => {
        const givenTitle = `I run unit tests with vitest`

        parser.addLine(`Feature: awesome feature`)
        parser.addLine(`Scenario: Example scenario`)
        parser.addLine(`Given ${givenTitle}`)
        parser.addLine(``)

        const currentScenario = getCurrentScenario(parser)
        const [currentStep] = currentScenario.steps

        expect(currentScenario.steps.length).toEqual(1)
        expect(currentStep.type).toEqual(StepTypes.GIVEN)
        expect(currentStep.details).toEqual(givenTitle)
        expect(currentStep.isCalled).toBeFalsy()
    })

    it(`should trim Scenario / Feature line title`, () => {
        const lineTitle = `Scenario:    remove space `

        parser.addLine(`Feature: awesome feature`)
        parser.addLine(lineTitle)
        parser.addLine(``)

        const [feature] = parser.features
        const [scenario] = feature.scenarii

        expect(scenario.description).toEqual(`remove space`)
    })

    it(`should trim step line title`, () => {
        const lineTitle = `Given    I love spaces in string `

        parser.addLine(`Feature: awesome feature`)
        parser.addLine(`Scenario: Example scenario`)
        parser.addLine(lineTitle)
        parser.addLine(``)

        const [feature] = parser.features
        const [scenario] = feature.scenarii
        const [step] = scenario.steps

        expect(step.details).toEqual(`I love spaces in string`)
    })

    it(`should be able to parse Scenario Outline line`, () => {
        const scenarioTitile = `awesome outline`

        parser.addLine(`Feature: awesome feature`)
        parser.addLine(`Scenario Outline: ${scenarioTitile}`)
        parser.addLine(``)

        const currentFeature = getCurrentFeaut(parser)
        const currentScenario = currentFeature.getScenarioByName(scenarioTitile)

        if (!currentScenario) {
            expect.fail(`Scenario shoutl exists`)
        }

        expect(currentScenario.description).toEqual(scenarioTitile)
        expect(currentScenario.isCalled).toBeFalsy()
        expect(currentScenario instanceof ScenarioOutline).toBeTruthy()
        expect((currentScenario as ScenarioOutline).examples).toEqual([])
    })

    it(`should be able to parse Scenario Template line`, () => {
        const scenarioTitile = `awesome outline`

        parser.addLine(`Feature: awesome feature`)
        parser.addLine(`Scenario Template:      ${scenarioTitile}`)
        parser.addLine(``)

        const currentFeature = getCurrentFeaut(parser)
        const currentScenario = currentFeature.getScenarioByName(scenarioTitile)

        if (!currentScenario) {
            expect.fail(`Scenario shoutl exists`)
        }

        expect(currentScenario.description).toEqual(scenarioTitile)
        expect(currentScenario.isCalled).toBeFalsy()
        expect(currentScenario instanceof ScenarioOutline).toBeTruthy()
        expect((currentScenario as ScenarioOutline).examples).toEqual([])
    })

    it(`should be able to read Examples`, () => {
        const scenarioTitile = `awesome outline`

        parser.addLine(`Feature: awesome feature`)
        parser.addLine(`Scenario Outline: ${scenarioTitile}`)
        parser.addLine(`Examples:`)
        parser.addLine(`| framework | language   |`)
        parser.addLine(`| Vue       | Javascript |`)
        parser.addLine(`| Stencil   | Typescript |`)
        parser.addLine(``)

        const currentFeature = getCurrentFeaut(parser)
        const currentScenario = currentFeature.getScenarioByName(scenarioTitile)

        expect(
            (currentScenario as ScenarioOutline).examples,
        ).toEqual([
            {
                framework : `Vue`,
                language : `Javascript`,
            },
            {
                framework : `Stencil`,
                language : `Typescript`,
            },
        ])
    })

    it(`should be able to read Scenarios`, () => {
        const scenarioTitile = `awesome outline`

        parser.addLine(`Feature: awesome feature`)
        parser.addLine(`Scenario Template: ${scenarioTitile}`)
        parser.addLine(`Scenarios:`)
        parser.addLine(`| framework | language   |`)
        parser.addLine(`| Vue       | Javascript |`)
        parser.addLine(`| Stencil   | Typescript |`)
        parser.addLine(``)

        const currentFeature = getCurrentFeaut(parser)
        const currentScenario = currentFeature.getScenarioByName(scenarioTitile)

        expect(
            (currentScenario as ScenarioOutline).examples,
        ).toEqual([
            {
                framework : `Vue`,
                language : `Javascript`,
            },
            {
                framework : `Stencil`,
                language : `Typescript`,
            },
        ])
    })

    it(`should check Examples at finish parse`, () => {
        const scenarioTitile = `awesome outline`

        parser.addLine(`Feature: awesome feature`)
        parser.addLine(`Scenario Outline: ${scenarioTitile}`)

        const currentFeature = getCurrentFeaut(parser)
        const currentScenario = currentFeature.getScenarioByName(scenarioTitile) as ScenarioOutline

        currentScenario.examples = []

        parser.addLine(`Examples:`)
        parser.addLine(`| framework | language   |`)
        parser.addLine(`| Vue       | Javascript |`)
        parser.addLine(`| Stencil   | Typescript |`)

        expect(currentScenario.examples).toEqual([])

        parser.finish()

        expect(
            currentScenario.examples,
        ).toEqual([
            {
                framework : `Vue`,
                language : `Javascript`,
            },
            {
                framework : `Stencil`,
                language : `Typescript`,
            },
        ])
    })

    it(`should handle commented line`, () => {
        const featureTitle = `Awesome unit tests`
        const newParser = new GherkinParser()

        newParser.addLine(`# Feature: ${featureTitle}`)

        const currentFeature = newParser.finish()

        expect(currentFeature.length).toEqual(0)
    })

    it(`should be able to parse Rule line`, () => {
        const ruleName = `Awesome unit tests for TS`

        parser.addLine(`Feature: awesome feature`)
        parser.addLine(`Rule: ${ruleName}`)
        parser.addLine(``)

        const currentFeature = getCurrentFeaut(parser)
        const [rule] = currentFeature.rules

        expect(currentFeature.rules.length).toEqual(1)
        expect(rule.name).toEqual(ruleName)
    })

    it(`should add scenario to rule`, () => {
        parser.addLine(`Feature: awesome feature`)
        parser.addLine(`Rule: I have two scenarii`)
        parser.addLine(`Scenario: first scenario`)
        parser.addLine(`Scenario: second scenario`)
        parser.addLine(``)

        const currentFeature = getCurrentFeaut(parser)
        const [rule] = currentFeature.rules

        expect(currentFeature.rules.length).toEqual(1)
        expect(rule.scenarii.length).toEqual(2)
    })

    it(`can handle multiple rules`, () => {
        parser.addLine(`Feature: awesome feature`)
        parser.addLine(`Rule: I have two scenarii`)
        parser.addLine(`Scenario: first scenario`)
        parser.addLine(`Scenario: second scenario`)
        parser.addLine(`Rule: I prefre scenario outline`)
        parser.addLine(`Scenario Outline: first scenario outline`)
        parser.addLine(`Examples:`)
        parser.addLine(`| framework | language   |`)
        parser.addLine(`| Vue       | Javascript |`)
        parser.addLine(`| Stencil   | Typescript |`)
        parser.addLine(``)

        const currentFeature = getCurrentFeaut(parser)
        const [firstRule, secondRule] = currentFeature.rules
        const [outline] = secondRule.scenarii

        expect(currentFeature.rules.length).toEqual(2)
        expect(firstRule.scenarii.length).toEqual(2)
        expect(secondRule.scenarii.length).toEqual(1)
        expect(outline instanceof ScenarioOutline).toBe(true)
        expect((outline as ScenarioOutline).examples).toEqual([
            {
                framework : `Vue`,
                language : `Javascript`,
            },
            {
                framework : `Stencil`,
                language : `Typescript`,
            },
        ])
    })

    it(`can add Scneario to Feature and Scenario to Rule`, async () => {
        parser.addLine(`Feature: test scenario for fule and feature`)
        parser.addLine(`Scenario: first scenario for the feature`)
        parser.addLine(`Scenario Outline: first scenario outline for the feature`)
        parser.addLine(`Rule: I have two scenarii`)
        parser.addLine(`Scenario: first scenario`)
        parser.addLine(`Scenario: second scenario`)

        const currentFeature = getCurrentFeaut(parser)
        const [rule] = currentFeature.rules

        expect(
            currentFeature.scenarii.map((s) => s.description),
        ).toContain(
            `first scenario for the feature`,
        )
        expect(
            currentFeature.scenarii.map((s) => s.description),
        ).toContain(
            `first scenario outline for the feature`,
        )

        expect(
            rule.scenarii.map((s) => s.description),
        ).toContain(
            `first scenario`,
        )
        expect(
            rule.scenarii.map((s) => s.description),
        ).toContain(
            `second scenario`,
        )
    })

    it(`should be able to add tag to scenario`, () => {
        parser.addLine(`Feature: test scenario for fule and feature`)
        parser.addLine(`    @example`)
        parser.addLine(`Scenario: with one tag`)
        parser.addLine(`@example`)
        parser.addLine(`@awesome`)
        parser.addLine(`@again`)
        parser.addLine(`Scenario Outline: with many tags`)
        parser.addLine(`@example @awesome @again`)
        parser.addLine(`Scenario Outline: another scenario with many tags`)
        parser.addLine(``)

        const currentFeature = getCurrentFeaut(parser)
        const [oneTag, manyLineTags, oneLineTags] = currentFeature.scenarii

        expect(
            oneTag.tags,
        ).toContain(`example`)
        expect(manyLineTags.tags).toEqual([
            `example`, `awesome`, `again`,
        ])
        expect(oneLineTags.tags).toEqual([
            `example`, `awesome`, `again`,
        ])
    })

    it(`should ignore tags without @`, () => {
        parser.addLine(`Feature: test scenario for fule and feature`)
        parser.addLine(`example`)
        parser.addLine(`Scenario: with one tag`)
        parser.addLine(`@example awesome @again`)
        parser.addLine(`Scenario Outline: another scenario with many tags`)
        parser.addLine(``)

        const currentFeature = getCurrentFeaut(parser)
        const [noTag, twoTags] = currentFeature.scenarii

        expect(noTag.tags.length).toBe(0)
        expect(twoTags.tags).toEqual([`example`, `again`])
    })

    it(`should be able to add tag to Feature`, () => {
        parser.addLine(`@example`)
        parser.addLine(`Feature: test scenario for fule and feature`)
        parser.addLine(`Scenario: with one tag`)

        const currentFeature = getCurrentFeaut(parser)

        expect(currentFeature.tags).toContain(`example`)
    })

    describe(`Background`, () => {
        it(`should be able to parse Background for Feature`, () => {
            parser.addLine(`Feature: I use background`)
            parser.addLine(`    @awesome`)
            parser.addLine(`    Background:`)
            parser.addLine(`        Given I use backgroun`)
            parser.addLine(`        And I love it`)
            parser.addLine(``)

            const currentFeature = getCurrentFeaut(parser)
            const { background } = currentFeature

            expect(background).not.toBeNull()
            expect(background?.steps.length).toBe(2)
            expect(background?.tags).toContain(`awesome`)
        })

        it(`should be able to parse Background for Rule`, () => {
            parser.addLine(`Feature: I use background`)
            parser.addLine(`    Background:`)
            parser.addLine(`        Given I use backgroun`)
            parser.addLine(`        And I love it`)
            parser.addLine(`    Rule: I need a background`)
            parser.addLine(`        Background:`)
            parser.addLine(`            Given I use also backgroun`)
            parser.addLine(`            And I love it`)
            parser.addLine(`            And I love forever`)
            parser.addLine(``)

            const currentFeature = getCurrentFeaut(parser)
            const { background, rules } = currentFeature

            expect(background).not.toBeNull()
            expect(background?.steps.length).toBe(2)
            expect(rules[0].background).not.toBeNull()
            expect(rules[0].background?.steps.length).toBe(3)
        })

        it(`should prevent twice backgrounds in Feature`, () => {
            expect(() => {
                parser.addLine(`Feature: I use background`)
                parser.addLine(`    Background:`)
                parser.addLine(`        Given I use backgroun`)
                parser.addLine(`        And I love it`)
                parser.addLine(`    Background:`)
                parser.addLine(`        Given I want another background`)
                parser.addLine(``)
            }).toThrowError(
                new TwiceBackgroundError(),
            )
        })

        it(`should prevent twice backgrounds in Rule`, () => {
            expect(() => {
                parser.addLine(`Feature: I use background`)
                parser.addLine(`    Background:`)
                parser.addLine(`        Given I use backgroun`)
                parser.addLine(`        And I love it`)
                parser.addLine(`    Rule: with background`)
                parser.addLine(`        Background:`)
                parser.addLine(`            Given I want another background`)
                parser.addLine(`        Background:`)
                parser.addLine(`            Given I want another background`)
                parser.addLine(``)
            }).toThrowError(
                new TwiceBackgroundError(),
            )
            parser = new GherkinParser()
            expect(() => {
                parser.addLine(`Feature: I use background`)
                parser.addLine(`    Background:`)
                parser.addLine(`        Given I use backgroun`)
                parser.addLine(`        And I love it`)
                parser.addLine(`    Rule: with background`)
                parser.addLine(`        Background:`)
                parser.addLine(`            Given I want another background`)
                parser.addLine(`    Rule: with background again`)
                parser.addLine(`        Background:`)
                parser.addLine(`            Given I want another background`)
                parser.addLine(``)
            }).not.toThrowError()
        })
    })

    describe(`DocStringss`, () => {

        describe(`DocStringss only`, () => {
            const feature = FeatureContentReader.fromString([
                `Feature: DocStrings`,
                `    Scenario: DocStrings example`,
                `        Given I use "DocStrings"`,
                `            """`,
                `            DocStrings is passed to current Given`,
                `            And at last params`,
                `            After ctx : TaskContext`,
                `            """`,
                `        Then I can check it`,
            ]).parseContent()

            describeFeature(feature, (f) => {
                f.Scenario(`DocStrings example`, (s) => {
                    s.Given(`I use "DocStrings"`, (ctx, docStrings : string) => {
                        expect(
                            docStrings.includes(`DocStrings is passed to current Given`),
                        ).toBe(true)
                    })
                    s.Then(`I can check it`, () => {
                        const docs = feature.scenarii.at(0)?.steps.at(0)?.docStrings
                        expect(
                            docs?.split(`\n`),
                        ).toEqual([
                            `DocStrings is passed to current Given`,
                            `And at last params`,
                            `After ctx : TaskContext`,
                        ])
                    })
                })
            })
        })

        describe(`DocStrings and expression`, () => {
            const feature = FeatureContentReader.fromString([
                `Feature: DocStrings`,
                `    Scenario: DocStrings example`,
                `        Given I use "DocStrings" 2 hours`,
                `            """`,
                `            DocStrings is passed to current Given`,
                `            And at last params`,
                `            After ctx : TaskContext`,
                `            """`,
                `        Then I can check it`,
            ]).parseContent()
            describeFeature(feature, (f) => {
                f.Scenario(`DocStrings example`, (s) => {
                    // eslint-disable-next-line max-params
                    s.Given(`I use {string} {number} hours`, (ctx, text : string, hours : number, docStrings : string) => {
                        expect(
                            docStrings.includes(`DocStrings is passed to current Given`),
                        ).toBe(true)
                        expect(text).toEqual(`DocStrings`)
                        expect(hours).toBe(2)
                    })
                    s.Then(`I can check it`, () => {
                        const docs = feature.scenarii.at(0)?.steps.at(0)?.docStrings
                        expect(
                            docs?.split(`\n`),
                        ).toEqual([
                            `DocStrings is passed to current Given`,
                            `And at last params`,
                            `After ctx : TaskContext`,
                        ])
                    })
                })
            })
        })

        describe(`DocStrings with backtick`, () => {
            const feature = FeatureContentReader.fromString([
                `Feature: DocStrings`,
                `    Scenario: DocStrings example`,
                `        Given I use "DocStrings" 2 tumes`,
                `            \`\`\``,
                `            DocStrings is passed to current Given`,
                `            And at last params`,
                `            After ctx : TaskContext`,
                `            \`\`\``,
                `        Then I can check it twice`,
                `            """`,
                `            DocStrings is awesome`,
                `            """`,
            ]).parseContent()
            describeFeature(feature, (f) => {
                f.Scenario(`DocStrings example`, (s) => {
                    // eslint-disable-next-line max-params
                    s.Given(`I use {string} {number} tumes`, (ctx, text : string, hours : number, docStrings : string) => {
                        expect(text).toEqual(`DocStrings`)
                        expect(hours).toBe(2)
                        expect(
                            docStrings.split(`\n`),
                        ).toEqual([
                            `DocStrings is passed to current Given`,
                            `And at last params`,
                            `After ctx : TaskContext`,
                        ])
                    })
                    s.Then(`I can check it twice`, (ctx, docStrings) => {
                        expect(docStrings).toEqual(
                            `DocStrings is awesome`,
                        )
                    })
                })
            })
        })

    })

})
