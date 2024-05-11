import { Rule } from "../../parser/Rule"
import { StepAble } from "../../parser/Stepable"
import { Feature } from "../../parser/feature"
import { Step } from "../../parser/step"
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

export function detectUncalledScenarioStep (scenario : StepAble, steps : Step[]) {
    ScenarioStateDetector
        .forScenario(scenario)
        .checkIfStepWasCalled(steps)
}