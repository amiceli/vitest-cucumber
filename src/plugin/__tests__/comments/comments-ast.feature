Feature: Comments Gherkin nodes

    Background:
        Given My feature file is "src/__tests__/comments-ast.feature"
        And   My spec file is "src/__tests__/comments-ast.spec.ts"

    Scenario: Comment steps removed from Scenario
        Given "Example" Scenario has two steps
            """
            Feature: Comments steps
                Scenario: I have two steps
                    Given I am first step
                    Then  I am last step
            """
        When  I remove "Given" step
            """
            Feature: Comments steps
                Scenario: I have two steps
                    Then  I am last step
            """
        Then  vitest-cucumber comments "Given" step

    Scenario: Comment Background removed from Feature
        Given Feature has a Background
            """
            Feature: Comments Background
                Background:
                    Given I am first Background step
                Scenario: I have two steps
                    Given I am first step
            """
        When  I remove Background from Feature
            """
            Feature: Comments Background
                Scenario: I have two steps
                    Given I am first step
            """
        Then  vitest-cucumber comments Background in Feature


    Scenario: Comment removed Scenario from Feature
        Given Feature has a two Scenario
            """
            Feature: Comments Scenario
                Scenario: first scenario
                    Given I am first Background step
                Scenario: last scenario
                    Given I am last step
            """
        When  I remove a "first scenario" Scenario from Feature
            """
            Feature: Comments Scenario
                Scenario: last scenario
                    Given I am last step
            """
        Then  vitest-cucumber comments "first scenario" Scenario in Feature

    Scenario: Comment removed Rule from Feature
        Given Feature has a "main" Rule
            """
            Feature: Comments Rule
                Rule: main
                    Scenario: last scenario
                        Given I am last step
            """
        When  I remove a "main" Rule from Feature
            """
            Feature: Comments Scenario
                Scenario: last scenario
                    Given I am last step
            """
        Then  vitest-cucumber comments "main" Rule in Feature
