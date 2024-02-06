import {
    test, expect, vi,
} from "vitest"
import { detectUnCalledScenarioAndRules } from "../../describe/teardowns"
import { Feature } from "../../../parser/feature"
import { Rule } from "../../../parser/Rule"
import { RuleNotCalledError, ScenarioNotCalledError } from "../../../errors/errors"
import { Scenario } from "../../../parser/scenario"
import { FeatureStateDetector } from "../../state-detectors/FeatureStateDetector"

test(`should check not called rules`, async () => {
    const spyDetector = vi.spyOn(FeatureStateDetector, `forFeature`)

    const feature = new Feature(`I have an uncalled rule`)
    const rule = new Rule(`Me I am called`)
    const secondRule = new Rule(`Me I am uncalled`)

    rule.isCalled = true
    feature.rules.push(rule, secondRule)

    expect(() => {
        detectUnCalledScenarioAndRules(feature)
    }).toThrowError(
        new RuleNotCalledError(secondRule),
    )
    expect(spyDetector).toHaveBeenCalledWith(feature)
})

test(`should check not called scenario`, async () => {
    const spyDetector = vi.spyOn(FeatureStateDetector, `forFeature`)

    const feature = new Feature(`I have an uncalled rule`)
    const scenario = new Scenario(`Me I am called`)
    const secondScenario = new Scenario(`Me I am uncalled`)

    scenario.isCalled = true
    feature.scenarii.push(scenario, secondScenario)

    expect(() => {
        detectUnCalledScenarioAndRules(feature)
    }).toThrowError(
        new ScenarioNotCalledError(secondScenario),
    )
    expect(spyDetector).toHaveBeenCalledWith(feature)
})