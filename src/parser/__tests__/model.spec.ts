import { Feature } from "../feature"
import { Rule } from "../Rule"
import {
    describe, test, expect, 
} from "vitest"
import { Scenario, ScenarioOutline } from "../scenario"
import { Step, StepTypes } from "../step"
import { Background } from "../Background"
import {
    BackgroundNotExistsError,
    FeatureUknowRuleError, FeatureUknowScenarioError, IsScenarioOutlineError, NotAllowedBackgroundStepTypeError, NotScenarioOutlineError, RuleNotCalledError, 
} from "../../errors/errors"

describe(`Models`, () => {

    describe(`Feature`, () => {
        test(`Feature initialize`, () => {
            const feature = new Feature(`Awesome`)
    
            expect(feature.name).toEqual(`Awesome`)
            expect(feature.scenarii.length).toEqual(0)
            expect(feature.background).toBeNull()
            expect(feature.getTitle()).toEqual(`Feature: Awesome`)
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
            expect(feature.getRuleByName(`another`)).toBeUndefined()
        })

        test(`Get first rule not called`, () => {
            const feature = new Feature(`Awesome`)
            const rule = new Rule(`rule`)
            rule.isCalled = true
            const secondRule = new Rule(`second rule`)
            secondRule.isCalled = false
            const uncalledRuleWithTag = new Rule(`with tag`)
            uncalledRuleWithTag.isCalled = true
            uncalledRuleWithTag.tags.push(`ignore`)

            feature.rules.push(rule)
            expect(feature.getFirstRuleNotCalled([])).toBeUndefined()

            feature.rules.push(uncalledRuleWithTag)
            expect(feature.getFirstRuleNotCalled([`ignore`])).toBeUndefined()
            
            feature.rules.push(secondRule)
            expect(feature.getFirstRuleNotCalled([])).toEqual(secondRule)
        })

        test(`Trhow an error if a Rule isn't called`, () => {
            const feature = new Feature(`test`)
            const rule = new Rule(`rule`)
            rule.tags.push(`ignore`)

            feature.rules.push(rule)

            expect(() => {
                feature.checkUncalledRule([])
            }).toThrowError(
                new RuleNotCalledError(rule),   
            )

            expect(() => {
                feature.checkUncalledRule([`test`])
            }).toThrowError(
                new RuleNotCalledError(rule),   
            )

            expect(() => {
                feature.checkUncalledRule([`ignore`])
            }).not.toThrowError()

            rule.isCalled = true

            expect(() => {
                feature.checkUncalledRule([])
            }).not.toThrowError()
        })

        test(`Check if rule exists`, () => {
            const feature = new Feature(`feature`)
            const rule = new Rule(`rule`)

            feature.rules.push(rule)

            expect(() => {
                feature.checkIfRuleExists(`another`)
            }).toThrowError(
                new FeatureUknowRuleError(
                    feature,
                    new Rule(`another`),
                ),
            )
            expect(
                feature.checkIfRuleExists(`rule`),
            ).toEqual(rule)
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

        test(`Get background`, () => {
            const feature = new Feature(`sample`)
            const background = new Background()
            expect(() => {
                feature.getBackground()
            }).toThrowError(
                new BackgroundNotExistsError(feature),
            )
            
            feature.background = background

            expect(
                feature.getBackground(),
            ).toEqual(background)
        })

        test(`Get Scenario by name`, () => {
            const scenario = new Scenario(`sample`)
            const outline = new ScenarioOutline(`outline`)
            const feature = new Feature(`sample`)

            feature.scenarii.push(scenario, outline)

            expect(() => {
                feature.getScenario(`another`)
            }).toThrowError(
                new FeatureUknowScenarioError(
                    feature, new Scenario(`another`),
                ),
            )

            expect(feature.getScenario(`sample`)).toEqual(scenario)

            expect(() => {
                feature.getScenario(`outline`)
            }).toThrowError(
                new IsScenarioOutlineError(outline),
            )
        })

        test(`Get Scenario Outline by name`, () => {
            const scenario = new Scenario(`sample`)
            const outline = new ScenarioOutline(`outline`)
            const feature = new Feature(`sample`)

            feature.scenarii.push(scenario, outline)

            expect(() => {
                feature.getScenarioOutline(`another`)
            }).toThrowError(
                new FeatureUknowScenarioError(
                    feature, new Scenario(`another`),
                ),
            )

            expect(feature.getScenarioOutline(`outline`)).toEqual(outline)

            expect(() => {
                feature.getScenarioOutline(`sample`)
            }).toThrowError(
                new NotScenarioOutlineError(scenario),
            )
        })
    })

    describe(`Rule`, () => {
        test(`Rule initialize`, () => {
            const rule = new Rule(`Awesome`)
    
            expect(rule.name).toEqual(`Awesome`)
            expect(rule.scenarii.length).toEqual(0)
            expect(rule.background).toBeNull()
            expect(rule.getTitle()).toEqual(`Rule: Awesome`)
            expect(rule.isCalled).toBe(false)
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

    describe(`Background`, () => {
        test(`Background initialize`, () => {
            const background = new Background()

            expect(background.steps.length).toEqual(0)
            expect(background.isCalled).toBeFalsy()
            expect(background.getTitle()).toEqual(`Background:`)
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
            expect(scenario.getTitle()).toEqual(`Scenario: First`)
        })

        test(`Scenaio check uncalled steps`, () => {
            const scenario = new Scenario(`test`)
            const step = new Step(StepTypes.AND, `test`)

            expect(scenario.hasUnCalledSteps()).toBeFalsy()

            scenario.addStep(step)

            expect(scenario.hasUnCalledSteps()).toBeTruthy()

            const noCalledSteps = scenario.getNoCalledStep()

            expect(noCalledSteps).toEqual(step)
        })

        test(`Scenario find step by name and title`, () => {
            const scenario = new Scenario(`test`)
            const step = new Step(StepTypes.AND, `test`)

            scenario.addStep(step)
            
            expect(
                scenario.findStepByTypeAndDetails(`And`, `test`),
            ).toEqual(step)

            expect(
                scenario.findStepByTypeAndDetails(`And`, `another`),
            ).toBeUndefined()

            expect(
                scenario.findStepByTypeAndDetails(`Given`, `test`),
            ).toBeUndefined()
        })

        test(`Scenario find step with expression`, () => {
            const scenario = new Scenario(`test`)
            const step = new Step(StepTypes.AND, `I love Vue 3`)

            scenario.addStep(step)
            
            expect(
                scenario.findStepByTypeAndDetails(`And`, `I love Vue {number}`),
            ).toEqual(step)

            expect(
                scenario.findStepByTypeAndDetails(`And`, `I love Vue {float}`),
            ).toBeUndefined()
        })

        test(`Scenario can be outline`, () => {
            const scenarioOutline = new ScenarioOutline(`outline`)

            expect(scenarioOutline.examples).toEqual([])
            expect(scenarioOutline.missingExamplesKeyword).toBeFalsy()
            expect(scenarioOutline.getTitle()).toEqual(`Scenario Outline: outline`)
        })

        test(`Scenario Outline can replace example in step title`, () => {
            const step = new Step(StepTypes?.GIVEN, `I use <framework>`)
            const scenarioOutline = new ScenarioOutline(`outline`)
            const example = { framework : `Vue` }

            expect(
                scenarioOutline.getStepTitle(step, example),
            ).toEqual(`Given I use Vue`)
        })
    })

    describe(`Taggable`, () => {
        test(`check if Taggable match tags`, () => {
            const scenario = new Scenario(`test`)
            scenario.tags = [`vitests`]

            expect(
                scenario.matchTags([`test`]),
            ).toBe(false)
            expect(
                scenario.matchTags([`vitests`]),
            ).toBe(true)
            expect(
                scenario.matchTags([`vitests`, `another`]),
            ).toBe(true)
        })
    })

    test(`Step initialize`, () => {
        const step = new Step(StepTypes.GIVEN, `I trye`)

        expect(step.type).toEqual(`Given`)
        expect(step.details).toEqual(`I trye`)
        expect(step.getTitle()).toEqual(`Given I trye`)
    })

})