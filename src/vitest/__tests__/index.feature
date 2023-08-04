Feature: vitest-gherkin

    Scenario: Forgot a scenario
        Given Developer using vitest-gherkin
        When  I forgot a scenario
        Then  vitest-gherkin throw an error

    Scenario: Bad scenario name
        Given Developer using again vitest-gherkin
        When  I type a wrong scenario name
        Then  vitest-gherkin throw an error

    Scenario: Scenario steps(s) validation
        Given Developer one more time vitest-gherkin
        When  I forgot a scenario step
        Then  vitest-gherkin throw an error
        And   I know which steps are missing