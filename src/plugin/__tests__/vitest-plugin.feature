Feature: vitest-cucumber plugin

    Scenario: Create spec file for new feature file
        Given "src/__tests__/awesome.spec.ts" doesn't exists
        When  I write "src/__tests__/awesome.feature"
        """
            Feature: new feature
                Scenario: new scenario
                    Given I am a step
        """
        Then  vitest-cucumber create "src/__tests__/awesome.spec.ts"
