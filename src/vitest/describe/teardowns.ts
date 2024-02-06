import { Rule } from "../../parser/Rule"
import { Feature } from "../../parser/feature"
import { FeatureStateDetector } from "../state-detectors/FeatureStateDetector"
import { RuleStateDetector } from "../state-detectors/RuleStateDetector"

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