import {
    test, expect, vi,
} from "vitest"
import {
    detectUnCalledScenarioAndRules,
    detectNotCalledRuleScenario,
} from "../../describe/teardowns"
import { Feature } from "../../../parser/feature"
import { Rule } from "../../../parser/Rule"
import { RuleNotCalledError, ScenarioNotCalledError } from "../../../errors/errors"
import { Scenario } from "../../../parser/scenario"
import { FeatureStateDetector } from "../../state-detectors/FeatureStateDetector"
import { RuleStateDetector } from "../../state-detectors/RuleStateDetector"

test(`should check not called rules`, async () => {
    const spyDetector = vi.spyOn(FeatureStateDetector, `forFeature`)

    const feature = new Feature(`I have an uncalled rule`)
    const rule = new Rule(`Me I am called`)
    const secondRule = new Rule(`Me I am uncalled`)

    rule.isCalled = true
    feature.addRule(rule)
    feature.addRule(secondRule)

    expect(() => {
        detectUnCalledScenarioAndRules(feature, [])
    }).toThrowError(
        new RuleNotCalledError(secondRule),
    )
    expect(spyDetector).toHaveBeenCalledWith(feature, [])
})

test(`should check not called scenario`, async () => {
    const spyDetector = vi.spyOn(FeatureStateDetector, `forFeature`)

    const feature = new Feature(`I have an uncalled rule`)
    const scenario = new Scenario(`Me I am called`)
    const secondScenario = new Scenario(`Me I am uncalled`)

    scenario.isCalled = true
    feature.addScenario(scenario)
    feature.addScenario(secondScenario)

    expect(() => {
        detectUnCalledScenarioAndRules(feature, [`test`])
    }).toThrowError(
        new ScenarioNotCalledError(secondScenario),
    )
    expect(spyDetector).toHaveBeenCalledWith(feature, [`test`])
})

test(`should detect rule not called scenario`, () => {
    const spyDetector = vi.spyOn(RuleStateDetector, `forRule`)
    const rule = new Rule(`I am a rule`)
    const scenario = new Scenario(`called scenario`)
    const secondScenario = new Scenario(`uncalled scenario`)

    scenario.isCalled = true
    rule.addScenario(scenario)
    rule.addScenario(secondScenario)

    expect(() => {
        detectNotCalledRuleScenario(rule, [`ignored`])
    }).toThrowError(
        new ScenarioNotCalledError(secondScenario),
    )
    expect(spyDetector).toHaveBeenCalledWith(rule, [`ignored`])
})
