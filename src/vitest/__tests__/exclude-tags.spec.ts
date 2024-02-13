import { describeFeature } from "../describe-feature"
import { loadFeature } from "../load-feature"
import fs from 'fs/promises'

describe(`Ignore scenario with a tag`, async () => {
    const gherkin = `
        Feature: detect uncalled rules
            Scenario: Simple scenario
                Given vitest-cucumber is running
                Then  It check I am executed
            @ignored
            Scenario: Ignored scenario
                Given vitest-cucumber is running
                Then  Don't check if I am called

    `
    await fs.writeFile(`./ignored-scenario.feature`, gherkin)

    const feature = await loadFeature(`./ignored-scenario.feature`)

    afterAll(async () => {
        await fs.unlink(`./ignored-scenario.feature`)
    })

    describeFeature(feature, ({ Scenario, AfterAllScenarios }) => {
        AfterAllScenarios(() => {
            expect(
                feature.getScenarioByName(`Ignored scenario`)?.isCalled,
            ).toBe(false)
            expect(
                feature.getScenarioByName(`Ignored scenario`)?.matchTags([`ignored`]),
            ).toBe(true)
        })
        Scenario(`Simple scenario`, ({ Given, Then }) => {
            Given(`vitest-cucumber is running`, () => {})
            Then(`It check I am executed`, () => { })
        })
    }, { excludeTags : [`ignored`] })
})

describe(`Ignore rule with a tag`, async () => {
    const gherkin = `
        Feature: detect uncalled rules
            @awesome
            Scenario: Simple scenario
                Given vitest-cucumber is running
                Then  check if I am called
            @normal
            Rule: ignored rule
                Scenario: My parent rule is called
                    Given vitest-cucumber is running
                    Then  my parent rule is called

    `
    await fs.writeFile(`./rules.feature`, gherkin)

    const feature = await loadFeature(`./rules.feature`)

    describeFeature(feature, ({ Scenario, AfterAllScenarios }) => {
        AfterAllScenarios(() => {
            expect(
                feature.getRuleByName(`ignored rule`)?.isCalled,
            ).toBe(false)
            expect(
                feature.getRuleByName(`ignored rule`)?.matchTags([`normal`]),
            ).toBe(true)
        })
        Scenario(`Simple scenario`, ({ Given, Then }) => {
            Given(`vitest-cucumber is running`, () => {
                expect(true).toBeTruthy()
            })
            Then(`check if I am called`, () => { })
        })
    }, { excludeTags : [`normal`] })
})

describe(`Ignore scenario in rule with a tag`, async () => {
    const gherkin = `
        Feature: detect uncalled rules
            @awesome
            Scenario: Me I am executed
                Given vitest-cucumber is running
                Then I am executed
            Rule: rule with ignored scenario
                @inside
                Scenario: I am also executed
                    Given vitest-cucumber is running
                    Then  my parent rule is called
                @ignored
                Scenario: Simple scenario
                    Given vitest-cucumber is running
                    Then  I am ignored

    `
    await fs.writeFile(`./rules.feature`, gherkin)

    const feature = await loadFeature(`./rules.feature`)

    describeFeature(feature, ({ Scenario, Rule, AfterAllScenarios }) => {
        AfterAllScenarios(() => {
            expect(
                feature
                    .getRuleByName(`rule with ignored scenario`)
                    ?.getScenarioByName(`Simple scenario`)
                    ?.isCalled,
            ).toBe(false)
            expect(
                feature
                    .getRuleByName(`rule with ignored scenario`)
                    ?.getScenarioByName(`Simple scenario`)
                    ?.matchTags([`ignored`]),
            ).toBe(true)
        })
        Scenario(`Me I am executed`, ({ Given, Then }) => {
            Given(`vitest-cucumber is running`, () => { })
            Then(`I am executed`, () => { })
        })
        Rule(`rule with ignored scenario`, ({ RuleScenario }) => {
            RuleScenario(`I am also executed`, ({ Given, Then }) => {
                Given(`vitest-cucumber is running`, () => {
                    expect(true).toBeTruthy()
                })
                Then(`my parent rule is called`, () => { })
            })
        })
    }, { excludeTags : [`ignored`] })
})