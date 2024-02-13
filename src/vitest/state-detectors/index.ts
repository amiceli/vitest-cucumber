import { Rule } from "../../parser/Rule"
import { ScenarioParent } from "../../parser/ScenarioParent"
import { Feature } from "../../parser/feature"
import { Scenario, ScenarioOutline } from "../../parser/scenario"
import { FeatureStateDetector } from "./FeatureStateDetector"
import { RuleStateDetector } from "./RuleStateDetector"
import { ScenarioStateDetector } from "./ScenarioStateDetector"

type CheckScenarioArgs<T extends ScenarioParent> = {
    scenarioDescription : string,
    parent : T,
    excludeTags : string []
}

export function checkScenarioInFeature (args : CheckScenarioArgs<Feature>) : Scenario {
    const scenario = FeatureStateDetector
        .forFeature(args.parent, args.excludeTags)
        .checkIfScenarioExists(args.scenarioDescription)

    FeatureStateDetector
        .forFeature(args.parent, args.excludeTags)
        .scenarioShouldNotBeOutline(scenario)

    return scenario
}

export function checkScenarioOutlineInFeature (args : CheckScenarioArgs<Feature>) : ScenarioOutline {
    const scenario = FeatureStateDetector
        .forFeature(args.parent, args.excludeTags)
        .checkIfScenarioExists<ScenarioOutline>(args.scenarioDescription)

    FeatureStateDetector
        .forFeature(args.parent, args.excludeTags)
        .scenarioShouldBeOutline(scenario)

    ScenarioStateDetector
        .forScenario(scenario)
        .checkExemples()

    return scenario
}

export function checkScenarioInRule (args : CheckScenarioArgs<Rule>) : Scenario {
    const scenario = RuleStateDetector
        .forRule(args.parent, args.excludeTags)
        .checkIfScenarioExists(args.scenarioDescription)

    RuleStateDetector
        .forRule(args.parent, args.excludeTags)
        .scenarioShouldNotBeOutline(scenario)

    return scenario
}

export function checkScenarioOutlineInRule (args : CheckScenarioArgs<Rule>) : ScenarioOutline {
    const scenario = RuleStateDetector
        .forRule(args.parent, args.excludeTags)
        .checkIfScenarioExists<ScenarioOutline>(args.scenarioDescription)

    RuleStateDetector
        .forRule(args.parent, args.excludeTags)
        .scenarioShouldBeOutline(scenario)

    ScenarioStateDetector
        .forScenario(scenario)
        .checkExemples()

    return scenario
}