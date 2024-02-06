import { Rule } from "../../parser/Rule"
import { Feature } from "../../parser/feature"
import { Scenario, ScenarioOutline } from "../../parser/scenario"
import { FeatureStateDetector } from "./FeatureStateDetector"
import { RuleStateDetector } from "./RuleStateDetector"
import { ScenarioStateDetector } from "./ScenarioStateDetector"

export function checkScenarioInFeature (scenarioDescription : string, feature : Feature) : Scenario {
    const scenario = FeatureStateDetector
        .forFeature(feature)
        .checkIfScenarioExists(scenarioDescription)

    FeatureStateDetector
        .forFeature(feature)
        .scenarioShouldNotBeOutline(scenario)

    return scenario
}

export function checkScenarioOutlineInFeature (scenarioDescription : string, feature : Feature) : ScenarioOutline {
    const scenario = FeatureStateDetector
        .forFeature(feature)
        .checkIfScenarioExists<ScenarioOutline>(scenarioDescription)

    FeatureStateDetector
        .forFeature(feature)
        .scenarioShouldBeOutline(scenario)

    ScenarioStateDetector
        .forScenario(scenario)
        .checkExemples()

    return scenario
}

export function checkScenarioInRule (scenarioDescription : string, rule : Rule) : Scenario {
    const scenario = RuleStateDetector
        .forRule(rule)
        .checkIfScenarioExists(scenarioDescription)

    RuleStateDetector
        .forRule(rule)
        .scenarioShouldNotBeOutline(scenario)

    return scenario
}

export function checkScenarioOutlineInRule (scenarioDescription : string, rule : Rule) : ScenarioOutline {
    const scenario = RuleStateDetector
        .forRule(rule)
        .checkIfScenarioExists<ScenarioOutline>(scenarioDescription)

    RuleStateDetector
        .forRule(rule)
        .scenarioShouldBeOutline(scenario)

    ScenarioStateDetector
        .forScenario(scenario)
        .checkExemples()

    return scenario
}