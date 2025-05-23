Feature: update Scenario, Background, ScenarioOutline steps

    Background:
        Given My feature file is "src/__tests__/step-ast.feature"
        And   My spec file is "src/__tests__/step-ast.spec.ts"

    Scenario Outline: Add steps in Scenario
        Given "add step" Scenario one step
            """
            Feature: add steps to Scenario
                Scenario: add step
                    Given I am already in scenario
                    When Another scenario step
            """
        When  I add a <type> <title> step
            """
            Feature: add steps to Scenario
                Scenario: add step
                    Given I am already in scenario
                    When Another scenario step
                    <type> <title>
            """
        Then  "add step" Scenario has two steps

        Examples:
            | type | title                    |
            | And  | I am new scenario step   |
            | Then | We are added in scenario |

    Scenario: Remove step from Scenario
        Given "main" Scenario has two steps
            """
            Feature: add steps to Scenario
                Scenario: main
                    Given I am first step
                    Then I  am last step
            """
        When I remove a step in "main" Scenario
            """
            Feature: add steps to Scenario
                Scenario: main
                    Then I  am last step
            """
        Then "main" scenario has one step

    Scenario Outline: Add steps in Background
        Given Feature has a Background with one step
            """
            Feature: add steps to Background
                Background:
                    Given I am first background step
                Scenario: test
                    When A scenrio should be here
            """
        When  I add a <type> <title> step in Background
            """
            Feature: add steps to Background
                Background:
                    Given I am first background step
                    <type> <title>
                Scenario: test
                    When A scenrio should be here
            """
        Then  Background has two steps

        Examples:
            | type | title                        |
            | And  | I am another background step |
            | And  | We are added in Background   |

    Scenario: Remove step from Background
        Given Background has two steps
            """
            Feature: add steps to Background
                Background:
                    Given I am first background step
                    And I am last background step
                Scenario: test
                    When A scenrio should be here
            """
        When I remove a step in "main" Scenario
            """
            Feature: add steps to Scenario
                Background:
                    Given I am first background step
                Scenario: test
                    When A scenrio should be here
            """
        Then Background has one step
