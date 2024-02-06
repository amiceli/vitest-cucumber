import { Rule } from "../../parser/Rule"
import { Feature } from "../../parser/feature"
import { Scenario } from "../../parser/scenario"
import { FeatureStateDetector } from "../state-detectors/FeatureStateDetector"
import { RuleStateDetector } from "../state-detectors/RuleStateDetector"
import { ScenarioStateDetector } from "../state-detectors/ScenarioStateDetector"

export function detectUnCalledScenarioAndRules (feature : Feature) {
    FeatureStateDetector
        .forFeature(feature)
        .checkNotCalledScenario()

    FeatureStateDetector
        .forFeature(feature)
        .checkNotCalledRule()
}

export function detectNotCalledRuleScenario (rule : Rule) {
    RuleStateDetector
        .forRule(rule)
        .checkNotCalledScenario()
}

export function detectUncalledScenarioStep (scenario : Scenario) {
    ScenarioStateDetector
        .forScenario(scenario)
        .checkIfStepWasCalled()
}