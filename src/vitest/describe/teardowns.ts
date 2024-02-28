import { Rule } from "../../parser/Rule"
import { Feature } from "../../parser/feature"
import { Scenario } from "../../parser/scenario"
import { FeatureStateDetector } from "../state-detectors/FeatureStateDetector"
import { RuleStateDetector } from "../state-detectors/RuleStateDetector"
import { ScenarioStateDetector } from "../state-detectors/ScenarioStateDetector"

export function detectUnCalledScenarioAndRules (
    feature : Feature,
    excludeTags : string[],
) {
    FeatureStateDetector
        .forFeature(feature, excludeTags)
        .checkNotCalledScenario()

    FeatureStateDetector
        .forFeature(feature, excludeTags)
        .checkNotCalledRule()
}

export function detectNotCalledRuleScenario (
    rule : Rule,
    excludeTags : string[],
) {
    RuleStateDetector
        .forRule(rule, excludeTags)
        .checkNotCalledScenario()
}

export function detectUncalledScenarioStep (scenario : Scenario) {
    ScenarioStateDetector
        .forScenario(scenario)
        .checkIfStepWasCalled()
}