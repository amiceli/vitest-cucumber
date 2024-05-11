import {
    it, expect, describe,
} from "vitest"
import { Feature } from '../../../parser/feature'
import { checkScenarioInFeature, checkScenarioOutlineInFeature } from ".."
import {
    FeatureUknowScenarioError, IsScenarioOutlineError, MissingScenarioOutlineVariableValueError, NotScenarioOutlineError, ScenarioOulineWithoutExamplesError, ScenarioOutlineVariableNotCalledInStepsError,
} from "../../../errors/errors"
import { Scenario, ScenarioOutline } from "../../../parser/scenario"
import { Step, StepTypes } from "../../../parser/step"

describe(`state detector utils`, () => {
    
    describe(`Scenario`, () => {
        it(`should detect if scenario exists in Feature`, () => {
            const feature = new Feature(`example`)
            const scenario = new Scenario(`good`)
    
            feature.addScenario(scenario)
    
            expect(() => {
                checkScenarioInFeature({
                    scenarioDescription : `test`,
                    parent : feature,
                    excludeTags : [],
                })
            }).toThrowError(
                new FeatureUknowScenarioError(
                    feature,
                    new Scenario(`test`),
                ),
            )
            expect(() => {
                checkScenarioInFeature({
                    scenarioDescription : `good`,
                    parent : feature,
                    excludeTags : [],
                })
            }).not.toThrowError()
        })
    
        it(`should detect if a scenario is outline`, () => {
            const feature = new Feature(`example`)
            const scenarioOutline = new ScenarioOutline(`outline`)
            const scenario = new Scenario(`scenario`)
    
            feature.addScenario(scenarioOutline)
            feature.addScenario(scenario)
    
            expect(() => {
                checkScenarioInFeature({
                    scenarioDescription : `outline`,
                    parent : feature,
                    excludeTags : [],
                })
            }).toThrowError(
                new IsScenarioOutlineError(
                    scenarioOutline,
                ),
            )
            expect(() => {
                checkScenarioInFeature({
                    scenarioDescription : `scenario`,
                    parent : feature,
                    excludeTags : [],
                })
            }).not.toThrowError()
        })
    })

    describe(`ScenarioOutline`, () => {
        it(`should detect if scenario outline exists in Feature`, () => {
            const feature = new Feature(`example`)
            const scenario = new ScenarioOutline(`good`)

            scenario.examples.push({ test : `ok ` })
            scenario.addStep(new Step(StepTypes.GIVEN, `awesome <test>`))
    
            feature.addScenario(scenario)
    
            expect(() => {
                checkScenarioOutlineInFeature({
                    scenarioDescription : `test`,
                    parent : feature,
                    excludeTags : [],
                })
            }).toThrowError(
                new FeatureUknowScenarioError(
                    feature,
                    new Scenario(`test`),
                ),
            )
            expect(() => {
                checkScenarioOutlineInFeature({
                    scenarioDescription : `good`,
                    parent : feature,
                    excludeTags : [],
                })
            }).not.toThrowError()
        })
    
        it(`should detect if a scenario not outline`, () => {
            const feature = new Feature(`example`)
            const scenarioOutline = new ScenarioOutline(`outline`)
            const scenario = new Scenario(`scenario`)

            scenarioOutline.examples.push({ test : `ok ` })
            scenarioOutline.addStep(new Step(StepTypes.GIVEN, `awesome <test>`))
    
            feature.addScenario(scenarioOutline)
            feature.addScenario(scenario)
    
            expect(() => {
                checkScenarioOutlineInFeature({
                    scenarioDescription : `scenario`,
                    parent : feature,
                    excludeTags : [],
                })
            }).toThrowError(
                new NotScenarioOutlineError(
                    scenario,
                ),
            )
            expect(() => {
                checkScenarioOutlineInFeature({
                    scenarioDescription : `outline`,
                    parent : feature,
                    excludeTags : [],
                })
            }).not.toThrowError()
        })

        it(`should detect if a scenario outline has missing examples`, () => {
            const feature = new Feature(`example`)
            const withoutExample = new ScenarioOutline(`withoutExample`)
            const missingExampleInStep = new ScenarioOutline(`missingExampleInStep`)
            const perfectOutline = new ScenarioOutline(`perfectOutline`)
            const missingVariablesValue = new ScenarioOutline(`missingValue`)
    
            missingExampleInStep.examples.push({ test : `ok` })
            perfectOutline.examples.push({ test : `ok` })
            missingVariablesValue.examples.push({ test : undefined })


            missingVariablesValue.addStep(new Step(StepTypes.GIVEN, `awesome <test>`))
            perfectOutline.addStep(new Step(StepTypes.GIVEN, `awesome <test>`))

            feature.addScenario(withoutExample)
            feature.addScenario(missingExampleInStep)
            feature.addScenario(perfectOutline)
            feature.addScenario(missingVariablesValue)
    
            expect(() => {
                checkScenarioOutlineInFeature({
                    scenarioDescription : `withoutExample`,
                    parent : feature,
                    excludeTags : [],
                })
            }).toThrowError(
                new ScenarioOulineWithoutExamplesError(
                    withoutExample,
                ),
            )

            expect(() => {
                checkScenarioOutlineInFeature({
                    scenarioDescription : `missingExampleInStep`,
                    parent : feature,
                    excludeTags : [],
                })
            }).toThrowError(
                new ScenarioOutlineVariableNotCalledInStepsError(
                    missingExampleInStep, `test`,
                ),
            )

            expect(() => {
                checkScenarioOutlineInFeature({
                    scenarioDescription : `missingValue`,
                    parent : feature,
                    excludeTags : [],
                })
            }).toThrowError(
                new MissingScenarioOutlineVariableValueError(
                    missingVariablesValue, `test`,
                ),
            )

            expect(() => {
                checkScenarioOutlineInFeature({
                    scenarioDescription : `perfectOutline`,
                    parent : feature,
                    excludeTags : [],
                })
            }).not.toThrowError()
        })
    })

})