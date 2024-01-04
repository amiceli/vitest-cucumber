Feature: vitest-cucumber

    Scenario: Example scenario
        Given I use feature file
        When  I run vitest-cucumber
        Then  My feature file is parsed

Feature: another vitest-cucumber feature

    Scenario: Use two features
        Given I use feature file
        When  I run vitest-cucumber
        Then  I have two features
        But   Is deprecated following Gherkin rules
