Feature: vitest-cucumber

    Scenario: Forgot a scenario
        Given Developer using vitest-cucumber
        When  I forgot a scenario
        Then  vitest-cucumber throw an error

    Scenario: Bad scenario name
        Given Developer using again vitest-cucumber
        When  I type a wrong scenario name
        Then  vitest-cucumber throw an error

    Scenario: Scenario steps(s) validation
        Given Developer one more time vitest-cucumber
        When  I forgot a scenario step
        Then  vitest-cucumber throw an error
        And   I know which steps are missing