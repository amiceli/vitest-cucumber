Feature: Use Gherkin in my unit tests

    Scenario: Detect when step isn't tested
        Given Front end developer using vitest
        When  I run my unit tests with vitest
        And   I forgot to test my Given scenario step
        Then  My test failed 
        And   I know with step I forgot
