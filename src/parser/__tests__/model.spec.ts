import { Feature } from "../feature"
import { Rule } from "../Rule"
import {
    describe, test, expect, 
} from "vitest"
import { Scenario, ScenarioOutline } from "../scenario"
import { Step, StepTypes } from "../step"

describe(`Models`, () => {

    describe(`Feature`, () => {
        test(`Feature initialize`, () => {
            const feature = new Feature(`Awesome`)
    
            expect(feature.name).toEqual(`Awesome`)
            expect(feature.scenarii.length).toEqual(0)
        })
    
        test(`Find Feature scneario by name`, () => {
            const feature = new Feature(`Awesome`)
            const scenario = new Scenario(`test`)
    
            feature.scenarii.push(scenario)
    
            expect(
                feature.getScenarioByName(`test`),
            ).toEqual(scenario)
        })

        test(`Check already called scenario`, () => {
            const feature = new Feature(`Awesome`)
            const scenario = new Scenario(`test`)

            feature.scenarii.push(scenario)
            
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

            feature.scenarii.push(scenario)
            feature.scenarii.push(outline)

            expect(feature.getScenarioExample(`outline`)).toEqual(outline.examples)
            expect(feature.getScenarioExample(`test`)).toBeNull()
        })

        test(`Get rule by name`, () => {
            const feature = new Feature(`Awesome`)
            const rule = new Rule(`rule`)

            feature.rules.push(rule)

            expect(feature.getRuleByName(`rule`)).toEqual(rule)
        })

        test(`Get first rule not called`, () => {
            const feature = new Feature(`Awesome`)
            const rule = new Rule(`rule`)
            rule.isCalled = true
            const secondRule = new Rule(`second rule`)
            secondRule.isCalled = false

            feature.rules.push(rule)
            expect(feature.getFirstRuleNotCalled()).toBeUndefined()
            
            feature.rules.push(secondRule)
            expect(feature.getFirstRuleNotCalled()).toEqual(secondRule)
        })

        test(`Check if have already called rule`, () => {
            const feature = new Feature(`Awesome`)
            const rule = new Rule(`rule`)
            rule.isCalled = false
            const secondRule = new Rule(`second rule`)
            secondRule.isCalled = true

            feature.rules.push(rule)
            expect(feature.haveAlreadyCalledRule()).toBeFalsy()

            feature.rules.push(secondRule)
            expect(feature.haveAlreadyCalledRule()).toBeTruthy()
        })
    })

    describe(`Rule`, () => {
        test(`Rule initialize`, () => {
            const rule = new Rule(`Awesome`)
    
            expect(rule.name).toEqual(`Awesome`)
            expect(rule.scenarii.length).toEqual(0)
        })
    
        test(`Find Rule scneario by name`, () => {
            const rule = new Rule(`Awesome`)
            const scenario = new Scenario(`test`)
    
            rule.scenarii.push(scenario)
    
            expect(
                rule.getScenarioByName(`test`),
            ).toEqual(scenario)
        })

        test(`Check already called scenario`, () => {
            const rule = new Rule(`Awesome`)
            const scenario = new Scenario(`test`)

            rule.scenarii.push(scenario)
            
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

            rule.scenarii.push(scenario)
            rule.scenarii.push(outline)

            expect(rule.getScenarioExample(`outline`)).toEqual(outline.examples)
            expect(rule.getScenarioExample(`test`)).toBeNull()
        })
    })

    describe(`Scenario`, () => {
        test(`Scenario initialize`, () => {
            const scenario = new Scenario(`First`)
    
            expect(scenario.description).toEqual(`First`)
            expect(scenario.steps.length).toEqual(0)
            expect(scenario.isCalled).toBeFalsy()
        })

        test(`Scenaio check uncalled steps`, () => {
            const scenario = new Scenario(`test`)
            const step = new Step(StepTypes.AND, `test`)

            expect(scenario.hasUnCalledSteps()).toBeFalsy()

            scenario.steps.push(step)

            expect(scenario.hasUnCalledSteps()).toBeTruthy()

            const noCalledSteps = scenario.getNoCalledSteps()

            expect(noCalledSteps.includes(step)).toBeTruthy()
        })

        test(`Scenario find step by name and title`, () => {
            const scenario = new Scenario(`test`)
            const step = new Step(StepTypes.AND, `test`)

            scenario.steps.push(step)
            
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
        })
    })
    

    test(`Step initialize`, () => {
        const step = new Step(StepTypes.GIVEN, `I trye`)

        expect(step.type).toEqual(`Given`)
        expect(step.details).toEqual(`I trye`)
    })

})