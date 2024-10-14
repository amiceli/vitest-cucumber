import { type Suite, type Task, describe, expect, test, vi } from 'vitest'
import { FeatureContentReader } from '../../__mocks__/FeatureContentReader.spec'
import type { ScenarioOutline } from '../../parser/models/scenario'
import { StepTypes } from '../../parser/models/step'
import { describeFeature } from '../describe-feature'

describe(`ScenarioOutline step title`, () => {
    const feature = FeatureContentReader.fromString([
        `Feature: one scenario with missing steps`,
        `   Scenario Outline: Simple scenario`,
        `       Given vitest-cucumber is <state>`,
        `       Then  check if I am <call>`,
        `       Examples:`,
        `           | state    | call     |`,
        `           | running  | called   |`,
        `           | finished | uncalled |`,
        ``,
    ]).parseContent()

    const scenarioOutline = feature.scenarii[0] as ScenarioOutline
    const getStepTitle = vi.spyOn(scenarioOutline, `getStepTitle`)
    const givenStep = scenarioOutline.findStepByTypeAndDetails(
        StepTypes.GIVEN,
        `vitest-cucumber is <state>`,
    )
    const thenStep = scenarioOutline.findStepByTypeAndDetails(
        StepTypes.THEN,
        `check if I am <call>`,
    )

    if (!givenStep || !thenStep) {
        test.fails(`Step not found`)
    }

    describeFeature(feature, (f) => {
        f.AfterAllScenarios(() => {
            expect(getStepTitle).toHaveBeenCalledTimes(4)
        })

        f.ScenarioOutline(`Simple scenario`, (s) => {
            s.Given(`vitest-cucumber is <state>`, () => {
                expect(getStepTitle).toHaveBeenCalledWith(givenStep, {
                    state: `running`,
                    call: `called`,
                })
                expect(getStepTitle).toHaveBeenCalledWith(givenStep, {
                    state: `finished`,
                    call: `uncalled`,
                })
            })
            s.Then(`check if I am <call>`, () => {
                expect(getStepTitle).toHaveBeenCalledWith(thenStep, {
                    state: `running`,
                    call: `called`,
                })
                expect(getStepTitle).toHaveBeenCalledWith(thenStep, {
                    state: `finished`,
                    call: `uncalled`,
                })
            })
        })
    })
})

describe(`Step with TestContext`, () => {
    const feature = FeatureContentReader.fromString([
        `Feature: TestContext`,
        `   Background:`,
        `       Given I use vitest-cucumber`,
        `   Scenario: simple scenario`,
        `       Given I have a test`,
        `       Then  I can use skip()`,
        `   Scenario Outline: Simple outline`,
        `       Given vitest-cucumber is <state>`,
        `       Then  check if I am <call>`,
        `       Examples:`,
        `           | state    | call     |`,
        `           | running  | called   |`,
        `           | finished | uncalled |`,
    ]).parseContent()

    describeFeature(feature, (f) => {
        let scenarioTask: Task
        f.AfterAllScenarios(() => {
            const background: Suite = scenarioTask.suite?.suite?.tasks?.find(
                ({ name }) => name === `Background:`,
            ) as Suite
            expect(background?.tasks[0].mode).toEqual(`skip`)
        })
        f.Background((b) => {
            b.Given(`I use vitest-cucumber`, (ctx) => {
                expect(typeof ctx.skip).toBe(`function`)
                ctx.skip()
            })
        })
        f.Scenario(`simple scenario`, (s) => {
            s.Given(`I have a test`, ({ skip }) => {
                expect(typeof skip).toBe(`function`)
            })
            s.Then(`I can use skip()`, (ctx) => {
                scenarioTask = ctx.task
                expect(typeof ctx.skip).toBe(`function`)
            })
        })
        f.ScenarioOutline(`Simple outline`, (s) => {
            s.Given(`vitest-cucumber is <state>`, (ctx) => {
                expect(typeof ctx.skip).toBe(`function`)
            })
            s.Then(`check if I am <call>`, (ctx) => {
                expect(typeof ctx.skip).toBe(`function`)
            })
        })
    })
})
