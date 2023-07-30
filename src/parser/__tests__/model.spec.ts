import { Feature } from "../feature";
import { describe, test, expect } from "vitest";
import { Scenario } from "../scenario";
import { Step, stepNames } from "../step";

describe('Models', () => {

    test('Feature initialize', () => {
        const feature = new Feature('Awesome')

        expect(feature.name).toEqual('Awesome')
        expect(feature.scenarii.length).toEqual(0)
    })

    test('Scenario initialize', () => {
        const scenario = new Scenario('First')

        expect(scenario.name).toEqual('First')
        expect(scenario.steps.length).toEqual(0)
    })

    test('Step initialize', () => {
        const step = new Step({
            name : stepNames.GIVEN, title : 'I trye'
        })

        expect(step.name).toEqual('Given')
        expect(step.title).toEqual('I trye')
    })

})