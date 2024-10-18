import { describe, expect, vi } from 'vitest'
import { FeatureContentReader } from '../../__mocks__/FeatureContentReader.spec'
import { describeFeature } from '../describe-feature'

describe(`Run scenario selected with a tag`, async () => {
    const feature = FeatureContentReader.fromString([
        `Feature: detect uncalled rules`,
        `    Scenario: Ignored scenario`,
        `        Given vitest-cucumber is running`,
        `        Then  Don't check if I am called`,
        `    @beta`,
        `    Scenario: Selected scenario`,
        `        Given vitest-cucumber is running`,
        `        Then  It check I am executed    `,
    ]).parseContent()

    describeFeature(
        feature,
        ({ Scenario, AfterAllScenarios }) => {
            AfterAllScenarios(() => {
                expect(
                    feature.getScenarioByName(`Ignored scenario`)?.isCalled,
                ).toBe(false)
                expect(
                    feature.getScenarioByName(`Selected scenario`)?.isCalled,
                ).toBe(true)
                expect(
                    feature
                        .getScenarioByName(`Selected scenario`)
                        ?.matchTags([`beta`]),
                ).toBe(true)
            })
            Scenario(`Selected scenario`, ({ Given, Then }) => {
                Given(`vitest-cucumber is running`, () => {})
                Then(`It check I am executed`, () => {})
            })
        },
        { includeTags: [`beta`] },
    )
})

describe(`Run scenario selected with a tag (alternative with an @ prefix)`, async () => {
    const feature = FeatureContentReader.fromString([
        `Feature: detect uncalled rules`,
        `    Scenario: Ignored scenario`,
        `        Given vitest-cucumber is running`,
        `        Then  Don't check if I am called`,
        `    @beta`,
        `    Scenario: Selected scenario`,
        `        Given vitest-cucumber is running`,
        `        Then  It check I am executed    `,
    ]).parseContent()

    describeFeature(
        feature,
        ({ Scenario, AfterAllScenarios }) => {
            AfterAllScenarios(() => {
                expect(
                    feature.getScenarioByName(`Ignored scenario`)?.isCalled,
                ).toBe(false)
                expect(
                    feature.getScenarioByName(`Selected scenario`)?.isCalled,
                ).toBe(true)
                expect(
                    feature
                        .getScenarioByName(`Selected scenario`)
                        ?.matchTags([`beta`]),
                ).toBe(true)
            })
            Scenario(`Selected scenario`, ({ Given, Then }) => {
                Given(`vitest-cucumber is running`, () => {})
                Then(`It check I am executed`, () => {})
            })
        },
        { includeTags: [`@beta`] },
    )
})

describe(`Run rule with a tag`, async () => {
    const feature = FeatureContentReader.fromString([
        `Feature: detect uncalled rules`,
        `    @awesome`,
        `    Scenario: Simple scenario`,
        `        Given vitest-cucumber is running`,
        `        Then  check if I am called`,
        `    @normal`,
        `    Rule: ignored rule`,
        `        Scenario: My parent rule is called`,
        `            Given vitest-cucumber is running`,
        `            Then  my parent rule is called`,
    ]).parseContent()

    describeFeature(
        feature,
        ({ Scenario, AfterAllScenarios }) => {
            AfterAllScenarios(() => {
                expect(feature.getRuleByName(`ignored rule`)?.isCalled).toBe(
                    false,
                )
                expect(
                    feature
                        .getRuleByName(`ignored rule`)
                        ?.matchTags([`normal`]),
                ).toBe(true)
            })
            Scenario(`Simple scenario`, ({ Given, Then }) => {
                Given(`vitest-cucumber is running`, () => {
                    expect(true).toBeTruthy()
                })
                Then(`check if I am called`, () => {})
            })
        },
        { includeTags: [`awesome`] },
    )
})

describe(`Run scenario in rule with a tag`, async () => {
    const feature = FeatureContentReader.fromString([
        `Feature: detect uncalled rules`,
        `    @awesome`,
        `    Scenario: Me I am executed`,
        `        Given vitest-cucumber is running`,
        `        Then I am executed`,
        `    Rule: rule with ignored scenario`,
        `        @inside`,
        `        Scenario: I am also executed`,
        `            Given vitest-cucumber is running`,
        `            Then  my parent rule is called`,
        `        @ignored`,
        `        Scenario: Simple scenario`,
        `            Given vitest-cucumber is running`,
        `            Then  I am ignored`,
    ]).parseContent()

    describeFeature(
        feature,
        ({ Scenario, Rule, AfterAllScenarios }) => {
            AfterAllScenarios(() => {
                expect(
                    feature
                        .getRuleByName(`rule with ignored scenario`)
                        ?.getScenarioByName(`Simple scenario`)?.isCalled,
                ).toBe(false)
                expect(
                    feature
                        .getRuleByName(`rule with ignored scenario`)
                        ?.getScenarioByName(`Simple scenario`)
                        ?.matchTags([`ignored`]),
                ).toBe(true)
            })
            Scenario(`Me I am executed`, ({ Given, Then }) => {
                Given(`vitest-cucumber is running`, () => {})
                Then(`I am executed`, () => {})
            })
            Rule(`rule with ignored scenario`, ({ RuleScenario }) => {
                RuleScenario(`I am also executed`, ({ Given, Then }) => {
                    Given(`vitest-cucumber is running`, () => {
                        expect(true).toBeTruthy()
                    })
                    Then(`my parent rule is called`, () => {})
                })
            })
        },
        { includeTags: [`inside`] },
    )
})

describe(`includeTags`, () => {
    describe(`default value`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: includeTags default value`,
            `   Rule: sample rule`,
            `       Scenario: includeTags is optional`,
            `           Given I have no tags`,
            `           Then  So I'm called`,
        ]).parseContent()

        const featureCheck = vi.spyOn(feature, `checkUncalledScenario`)
        const ruleCheck = vi.spyOn(feature, `checkUncalledScenario`)

        describeFeature(feature, (f) => {
            f.AfterAllScenarios(() => {
                expect(featureCheck).toHaveBeenCalledWith({
                    includeTags: [],
                    excludeTags: ['ignore'],
                })
                expect(ruleCheck).toHaveBeenCalledWith({
                    includeTags: [],
                    excludeTags: ['ignore'],
                })
            })
            f.Rule(`sample rule`, (r) => {
                r.RuleScenario(`includeTags is optional`, (s) => {
                    s.Given(`I have no tags`, () => {})
                    s.Then(`So I'm called`, () => {})
                })
            })
        })
    })
    describe(`include Rule and Scenario`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: includeTags used`,
            `   @ignored-scenario`,
            `   Scenario: A Feature ignored Scenario`,
            `       Given I have a tag`,
            `       Then  So I'm ignored`,
            `   Rule: sample rule`,
            `       @simple`,
            `       Scenario: no ignored scenario`,
            `           Given I have simple tag`,
            `           Then  So I'm called`,
            `       @ignored-scenario`,
            `       Scenario: A Rule ignored Scenario`,
            `           Given I have a tag`,
            `           Then  So I'm ignored`,
            `   @ignored-rule`,
            `   Rule: ignored rule`,
            `       Scenario: full ignored`,
            `           Given My parent has a tag`,
            `           Then  So I'm ignored`,
        ]).parseContent()

        const featureCheckUncalledRule = vi.spyOn(feature, `checkUncalledRule`)
        const featureCheckUncalledScenario = vi.spyOn(
            feature,
            `checkUncalledScenario`,
        )
        const featureCheckUncalledBackground = vi.spyOn(
            feature,
            `checkUncalledBackground`,
        )

        const ruleCheckUncalledScenario = vi.spyOn(
            feature.rules[0],
            `checkUncalledScenario`,
        )
        const ruleCheckUncalledBackground = vi.spyOn(
            feature.rules[0],
            `checkUncalledBackground`,
        )

        describeFeature(
            feature,
            (f) => {
                f.AfterAllScenarios(() => {
                    const checks = [
                        featureCheckUncalledRule,
                        featureCheckUncalledScenario,
                        featureCheckUncalledBackground,
                        ruleCheckUncalledScenario,
                        ruleCheckUncalledBackground,
                    ]

                    for (const fn of checks) {
                        expect(fn).toHaveBeenCalledWith({
                            includeTags: [`simple`],
                            excludeTags: [],
                        })
                    }

                    expect(
                        feature.getScenarioByName(`A Feature ignored Scenario`)
                            ?.isCalled,
                    ).toBe(false)
                    expect(
                        feature.getRuleByName(`ignored rule`)?.isCalled,
                    ).toBe(false)
                    expect(
                        feature.getRuleByName(`ignored rule`)?.scenarii[0]
                            ?.isCalled,
                    ).toBe(false)
                    expect(
                        feature
                            .getRuleByName(`sample rule`)
                            ?.getScenarioByName(`no ignored scenario`)
                            ?.isCalled,
                    ).toBe(true)
                    expect(
                        feature
                            .getRuleByName(`sample rule`)
                            ?.getScenarioByName(`A Rule ignored Scenario`)
                            ?.isCalled,
                    ).toBe(false)
                })
                f.Rule(`sample rule`, (r) => {
                    r.RuleScenario(`no ignored scenario`, (s) => {
                        s.Given(`I have simple tag`, () => {})
                        s.Then(`So I'm called`, () => {})
                    })
                })
            },
            {
                includeTags: [`simple`],
                excludeTags: [],
            },
        )
    })
})
