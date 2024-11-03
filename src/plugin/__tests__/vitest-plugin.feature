Feature: vitest-cucumber plugin

    Scenario: Create spec file for new feature file
        Given "src/__tests__/awesome.spec.ts" doesn't exists
        When  I write "src/__tests__/awesome.feature"
        Then  vitest-cucumber create "src/__tests__/awesome.spec.ts"

    Rule: Update spec file when feature changed
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
                    Scenario: example
                        Given I'm example scenario step
            """
            Then  vitest-cucumber remove "example" scenario in "src/__tests__/awesome.spec.ts"

