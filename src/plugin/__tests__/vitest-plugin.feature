Feature: vitest-cucumber plugin

    Scenario: Create spec file for new feature file
        Given "src/__tests__/awesome.spec.ts" doesn't exists
        When  I write "src/__tests__/awesome.feature"
        Then  vitest-cucumber create "src/__tests__/awesome.spec.ts"

    Rule: Update scenario when feature changed
        Background:
            Given My feature file is "src/__tests__/awesome.feature"
            And   My spec file is "src/__tests__/awesome.spec.ts"

        Scenario: Add scenario to spec file
            Given "src/__tests__/awesome.spec.ts" hasn't scenario
            When  I add a scenario into "src/__tests__/awesome.feature"
                """
                Feature: example
                    Scenario: new scenario
                        Given I'm new scenario
                        Then  I'm added into spec file
                """
            Then  vitest-cucumber add new scenario in "src/__tests__/awesome.spec.ts"

        Scenario: Remove scenario in feature file
            Given 'src/__tests__/awesome.feature' has "example" scenario
            """
                Feature: example
                    Scenario: example
                        Given I'm example scenario step
                    Scenario: another
                        Given I'm another scenario step
            """
            And 'src/__tests__/awesome.spec.ts' has "example" scenario
            When  I remove "example" scenario in "src/__tests__/awesome.feature"
            """
                Feature: example
                    Scenario: another
                        Given I'm another scenario step
            """
            Then  vitest-cucumber remove "example" scenario in "src/__tests__/awesome.spec.ts"

    Rule: Update scenario steps when feature changed
        Background:
            Given My feature file is "src/__tests__/awesome.feature"
            And   My spec file is "src/__tests__/awesome.spec.ts"
            And   I have "example" Scenario
            """
            Feature: example
                Scenario: example
                    Given I am first step
            """

        Scenario: add new step in Scenario
            Given 'src/__tests__/awesome.feature' has "example" scenario
            When  I add a step in "src/__tests__/awesome.feature" for "example" scenario
            """
            Feature: example
                Scenario: example
                    Given I am first step
                    Then  I am last step
            """
            Then  "example" scenario has 2 steps

        Scenario: remove a step in Scenario
            Given 'src/__tests__/awesome.feature' has "example" scenario
            When  I remove a step in "src/__tests__/awesome.feature" for "example" scenario
            Then  "example" scenario has 1 step

    Rule: Update rule when feature changed
        Background:
            Given My feature file is "src/__tests__/awesome.feature"
            And   My spec file is "src/__tests__/awesome.spec.ts"

        Scenario: Add rule to spec file
            Given "src/__tests__/awesome.spec.ts" hasn't rule
            When  I add a Rule into "src/__tests__/awesome.feature"
                """
                Feature: example
                    Rule: new Rule
                        Scenario: new Rule scenario
                            Given I'm new scenario
                            Then  I'm added into spec file
                """
            Then  vitest-cucumber add new rule in "src/__tests__/awesome.spec.ts"

        Scenario: Remove rule in feature file
            Given 'src/__tests__/awesome.feature' has "awesome rule" rule
            """
                Feature: example
                    Rule: awesome rule
                        Scenario: awesome rule scenario
                            Given I'm example scenario step
                    Rule: another rule
                        Scenario: another rule scenario
                            Given I'm another scenario step
            """
            And 'src/__tests__/awesome.spec.ts' has "awesome rule" rule
            When  I remove "awesome rule" rule in "src/__tests__/awesome.feature"
            """
                Feature: example
                    Rule: another rule
                        Scenario: another rule scenario
                            Given I'm another scenario step
            """
            Then  vitest-cucumber remove "awesome rule" rule in "src/__tests__/awesome.spec.ts"
