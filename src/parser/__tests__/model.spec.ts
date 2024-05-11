import { Feature } from "../feature"
import { Rule } from "../Rule"
import {
    describe, test, expect,
} from "vitest"
import { Scenario, ScenarioOutline } from "../scenario"
import { Step, StepTypes } from "../step"
import { Background } from "../Background"
import { NotAllowedBackgroundStepTypeError } from "../../errors/errors"
import { StepAble } from "../Stepable"

describe(`Models`, () => {

    describe(`Feature`, () => {
        test(`Feature initialize`, () => {
            const feature = new Feature(`Awesome`)
    
            expect(feature.name).toEqual(`Awesome`)
            expect(feature.scenarii.length).toEqual(0)
            expect(feature.rules.length).toEqual(0)
            expect(feature.background).toBeUndefined()
            expect(feature.toString()).toBe(`Feature: Awesome`)
        })

        test(`Add StepAble to Feature`, () => {
            const feature = new Feature(`Awesome`)

            const scenario = new Scenario(`test`)
            const scenarioOutline = new ScenarioOutline(`outline`)
            const background = new Background()

            feature.addScenario(scenario)
            feature.addScenario(scenarioOutline)
            feature.setBackground(background)

            expect(feature.scenarii.length).toBe(2)
            expect(scenario.parent).toEqual(feature)
            expect(scenarioOutline.parent).toEqual(feature)
            expect(background.parent).toEqual(feature)
        })
    
        test(`Find Feature scneario by name`, () => {
            const feature = new Feature(`Awesome`)
            const scenario = new Scenario(`test`)
    
            feature.addScenario(scenario)
    
            expect(
                feature.getScenarioByName(`test`),
            ).toEqual(scenario)
        })

        test(`Check already called scenario`, () => {
            const feature = new Feature(`Awesome`)
            const scenario = new Scenario(`test`)

            feature.addScenario(scenario)
            
            expect(feature.haveAlreadyCalledScenario()).toBeFalsy()

            scenario.isCalled = true

            expect(feature.haveAlreadyCalledScenario()).toBeTruthy()
        })

        test(`Get scenario outline examples`, () => {
            const feature = new Feature(`Awesome`)
            const scenario = new Scenario(`test`)
            const outline = new ScenarioOutline(`outline`)

            expect(outline.missingExamplesKeyword).toBeFalsy()
            expect(outline.examples).toEqual([])
            outline.examples = [{ test : [`yes`, `no`] }]

            feature.addScenario(scenario)
            feature.addScenario(outline)

            expect(feature.getScenarioExample(`outline`)).toEqual(outline.examples)
            expect(feature.getScenarioExample(`test`)).toBeNull()
        })

        test(`Add Rule to Feature`, () => {
            const feature = new Feature(`Awesome`)
            const rule = new Rule(`rule`)

            feature.addRule(rule)

            expect(rule.parent).toEqual(feature)
            expect(feature.rules.length).toBe(1)
        })

        test(`Get rule by name`, () => {
            const feature = new Feature(`Awesome`)
            const rule = new Rule(`rule`)

            feature.addRule(rule)

            expect(feature.getRuleByName(`rule`)).toEqual(rule)
        })

        test(`Get first rule not called`, () => {
            const feature = new Feature(`Awesome`)
            const rule = new Rule(`rule`)
            rule.isCalled = true
            const secondRule = new Rule(`second rule`)
            secondRule.isCalled = false

            feature.addRule(rule)
            expect(feature.getFirstRuleNotCalled([])).toBeUndefined()
            
            feature.addRule(secondRule)
            expect(feature.getFirstRuleNotCalled([])).toEqual(secondRule)
        })

        test(`Check if have already called rule`, () => {
            const feature = new Feature(`Awesome`)
            const rule = new Rule(`rule`)
            rule.isCalled = false
            const secondRule = new Rule(`second rule`)
            secondRule.isCalled = true

            feature.addRule(rule)
            expect(feature.haveAlreadyCalledRule()).toBeFalsy()

            feature.addRule(secondRule)
            expect(feature.haveAlreadyCalledRule()).toBeTruthy()
        })
    })

    describe(`Rule`, () => {
        test(`Rule initialize`, () => {
            const rule = new Rule(`Awesome`)
            const feature = new Feature(`awesome`)
    
            expect(rule.name).toEqual(`Awesome`)
            expect(rule.scenarii.length).toEqual(0)
            expect(rule.background).toBeUndefined()
            expect(rule.parent).toBeUndefined()
            expect(rule.toString()).toEqual(`Rule: Awesome`)

            rule.setParent(feature)

            expect(rule.parent).toEqual(feature)
        })
    
        test(`Find Rule scneario by name`, () => {
            const rule = new Rule(`Awesome`)
            const scenario = new Scenario(`test`)
    
            rule.addScenario(scenario)
    
            expect(
                rule.getScenarioByName(`test`),
            ).toEqual(scenario)
        })

        test(`Check already called scenario`, () => {
            const rule = new Rule(`Awesome`)
            const scenario = new Scenario(`test`)

            rule.addScenario(scenario)
            
            expect(rule.haveAlreadyCalledScenario()).toBeFalsy()

            scenario.isCalled = true

            expect(rule.haveAlreadyCalledScenario()).toBeTruthy()
        })

        test(`Get scenario outline examples`, () => {
            const rule = new Rule(`Awesome`)
            const scenario = new Scenario(`test`)
            const outline = new ScenarioOutline(`outline`)

            expect(outline.missingExamplesKeyword).toBeFalsy()
            expect(outline.examples).toEqual([])
            outline.examples = [{ test : [`yes`, `no`] }]

            rule.addScenario(scenario)
            rule.addScenario(outline)

            expect(rule.getScenarioExample(`outline`)).toEqual(outline.examples)
            expect(rule.getScenarioExample(`test`)).toBeNull()
        })
    })

    describe(`StepAble`, () => {
        test(`StepAble parent`, () => {
            const stepable : StepAble = new Background()

            expect(stepable.parent).toBeUndefined()

            stepable.setParent(new Feature(`test`))
            expect(stepable.parent?.name).toEqual(`test`)
        })
        test(`Add step to StepAble`, () => {
            const stepable: StepAble = new Scenario(`test`)
            const step = new Step(StepTypes.GIVEN, `test`)

            expect(step.parent).toBeUndefined()

            stepable.addStep(step)

            expect(stepable.steps.length).toBe(1)
            expect(step.parent).toBe(stepable)
        })
    })

    describe(`Background`, () => {
        test(`Background initialize`, () => {
            const background = new Background()

            expect(background.steps.length).toEqual(0)
            expect(background.isCalled).toBeFalsy()
            expect(background.toString()).toBe(`Background:`)
        })

        test(`Backgorund allowed step type`, () => {
            const background = new Background()

            expect(() => {
                background.addStep(new Step(StepTypes.GIVEN, `test`)) 
                background.addStep(new Step(StepTypes.AND, `test`))
            }).not.toThrowError()

            expect(() => {
                background.addStep(new Step(StepTypes.WHEN, `test`)) 
            }).toThrowError(
                new NotAllowedBackgroundStepTypeError(StepTypes.WHEN),
            )
            expect(() => {
                background.addStep(new Step(StepTypes.THEN, `test`)) 
            }).toThrowError(
                new NotAllowedBackgroundStepTypeError(StepTypes.THEN),
            )
            expect(() => {
                background.addStep(new Step(StepTypes.BUT, `test`)) 
            }).toThrowError(
                new NotAllowedBackgroundStepTypeError(StepTypes.BUT),
            )
        })
    })

    describe(`Scenario`, () => {
        test(`Scenario initialize`, () => {
            const scenario = new Scenario(`First`)
    
            expect(scenario.description).toEqual(`First`)
            expect(scenario.steps.length).toEqual(0)
            expect(scenario.isCalled).toBeFalsy()
            expect(scenario.toString()).toBe(`Scenario: First`)
        })

        test(`Scenaio check uncalled steps`, () => {
            const scenario = new Scenario(`test`)
            const step = new Step(StepTypes.AND, `test`)

            expect(scenario.hasUnCalledSteps()).toBeFalsy()

            scenario.addStep(step)

            expect(scenario.hasUnCalledSteps()).toBeTruthy()

            const noCalledSteps = scenario.getNoCalledSteps()

            expect(noCalledSteps.includes(step)).toBeTruthy()
        })

        test(`Scenario find step by name and title`, () => {
            const scenario = new Scenario(`test`)
            const step = new Step(StepTypes.AND, `test`)

            scenario.addStep(step)
            
            expect(
                scenario.findStepByTypeAndDetails(`And`, `test`),
            ).toEqual(step)

            expect(
                scenario.findStepByTypeAndDetails(`Given`, `test`),
            ).toBeUndefined()
        })

        test(`Scenario can be outline`, () => {
            const scenarioOutline = new ScenarioOutline(`outline`)

            expect(scenarioOutline.examples).toEqual([])
            expect(scenarioOutline.missingExamplesKeyword).toBeFalsy()
            expect(scenarioOutline.toString()).toBe(`Scenario Outline: outline`)
        })
    })

    test(`Step initialize`, () => {
        const step = new Step(StepTypes.GIVEN, `I test`)

        expect(step.type).toEqual(`Given`)
        expect(step.details).toEqual(`I test`)
        expect(step.toString()).toBe(`Given I test`)
    })

})