import { Feature } from "../feature";
import { describe, test, expect } from "vitest";
import { Scenario } from "../scenario";
import { Step, stepNames } from "../step";

describe('Models', () => {

    describe('Feature', () => {
        test('Feature initialize', () => {
            const feature = new Feature('Awesome')
    
            expect(feature.name).toEqual('Awesome')
            expect(feature.scenarii.length).toEqual(0)
        })
    
        test('Find Feature scneario by name', () => {
            const feature = new Feature('Awesome')
            const scenario = new Scenario('test')
    
            feature.scenarii.push(scenario)
    
            expect(feature.getScenarioByName('test')).toEqual(scenario)
        })
    })

    describe('Scenario', () => {
        test('Scenario initialize', () => {
            const scenario = new Scenario('First')
    
            expect(scenario.name).toEqual('First')
            expect(scenario.steps.length).toEqual(0)
        })

        test('Scenaio check uncalled steps', () => {
            const scenario = new Scenario('test')
            const step = new Step({
                name : stepNames.AND, title : 'test',
            })

            expect(scenario.hasUnCalledSteps()).toBeFalsy()

            scenario.steps.push(step)

            expect(scenario.hasUnCalledSteps()).toBeTruthy()

            const noCalledSteps = scenario.getNoCalledSteps()

            expect(noCalledSteps.includes(step)).toBeTruthy()
        })

        test('Scenario find step by name and title', () => {
            const scenario = new Scenario('test')
            const step = new Step({
                name : stepNames.AND, title : 'test',
            })

            scenario.steps.push(step)
            
            expect(
                scenario.getStepByNameAndTitle('And', 'test')
            ).toEqual(step)

            expect(
                scenario.getStepByNameAndTitle('Given', 'test')
            ).toBeUndefined()
        })
    })
    

    test('Step initialize', () => {
        const step = new Step({
            name : stepNames.GIVEN, title : 'I trye'
        })

        expect(step.name).toEqual('Given')
        expect(step.title).toEqual('I trye')
    })

})