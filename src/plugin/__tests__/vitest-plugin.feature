Feature: vitest-cucumber plugin

    Background:
        Given My feature files are in "src/__tests__/"
        And   My spec files are in "src/__tests__/"

    Scenario: Create spec file for new feature file
        Given "src/__tests__/awesome.spec.ts" doesn't exists
        When  I write "src/__tests__/awesome.feature"
        Then  vitest-cucumber create "src/__tests__/awesome.spec.ts"

    Scenario: Add scenario to spec file
        Given "src/__tests__/awesome.spec.ts" hasn't scenario
        When  I add a scenario into "src/__tests__/awesome.feature"
        """
        Scenario: example
            Given I'm new scenario
            Then  I'm added into spec file
        """
        Then  vitest-cucumber add new scenario in "src/__tests__/awesome.spec.ts"

    Scenario: Remove scenario in feature file
        Given "src/__tests__/awesome.feature" as "example" scenario
        When  I remove "example" scenario in feature file
        Then  vitest-cucumber remove "example" scenario in "src/__tests__/awesome.spec.ts"

