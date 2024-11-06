Feature: update Rule and Feature Background

    Background:
        Given My feature file is "src/__tests__/awesome.feature"
        And   My spec file is "src/__tests__/awesome.spec.ts"

    Scenario: Add Background in Feautre 
        Given Feature has no Background
            """
            Feature: I love Background
                Scenario: My parent has no Background
                    Given I am a Scenario step
            """
        When  I add a Background in Feature
            """
            Feature: I love Background
                Background:
                    Given I am a Background step
                Scenario: My parent has no Background
                    Given I am a step
            """
        Then  vitest-cucumber add a Background in Feature

    Scenario: Remove Background in Feature
        Given Feature has a Background
            """
            Feature: I love Background
                Background:
                    Given I am a Background step
                Scenario: My parent has no Background
                    Given I am a step
            """
        When  I remove Background from Feature
            """
            Feature: I love Background
                Scenario: My parent has no Background
                    Given I am a Scenario step
            """
        Then  vitest-cucumber remove Background in Feature

    Scenario: Add Background in Rule 
        Given Rule has no Background
            """
            Feature: Add Background in Rule 
                Rule: I want Background
                    Scenario: My parent Rule has no Background
                        Given I am a RuleScenario step
            """
        When  I add a Background in Rule
            """
            Feature: Add Background in Rule 
                Rule: I want Background
                    Background:
                        Given I am as Background step
                    Scenario: My parent Rule has no Background
                        Given I am a RuleScenario step
            """
        Then  vitest-cucumber add a Background in Rule

    Scenario: Remove Background in Rule
        Given Rule has Background
            """
            Feature: I use Background
                Rule: I love Background
                    Background:
                        Given I am as Background step
                    Scenario: My rule parent has no Background
                        Given I am a Scenario step
            """
        When  I remove Background from Rule
            """
            Feature: I use Background
                Rule: I love Background
                    Scenario: My rule parent has no Background
                        Given I am a Scenario step
            """
        Then  vitest-cucumber remove Background from Rule
