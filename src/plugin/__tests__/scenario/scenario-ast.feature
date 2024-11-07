Feature: update Rule and Feature Scenario

    Background:
        Given My feature file is "src/__tests__/awesome.feature"
        And   My spec file is "src/__tests__/awesome.spec.ts"

    Scenario: Add Scenario in Feautre 
        Given Feature has one Scenario
            """
            Feature: I love Scenario
                Scenario: A normal scenario
                    Given I am a Scenario step
            """
        When  I add a Scenario in Feature
            """
            Feature: I love Scenario
                Scenario: A normal scenario
                    Given I am a Scenario step
                Scenario: Another scenario
                    Given I am another Scenario step
            """
        Then  vitest-cucumber add a Scenario in Feature

    Scenario: Remove Background in Feature
        Given Feature has two Scenario
            """
            Feature: I love Scenario
                Scenario: A normal scenario
                    Given I am a Scenario step
                Scenario: Another scenario
                    Given I am another Scenario step
            """
        When  I remove Background from Feature
            """
            Feature: I love Scenario
                Scenario: A normal scenario
                    Given I am a Scenario step
            """
        Then  vitest-cucumber remove Scenario from Feature

    Scenario: Add Scenario in Rule 
        Given Rule has one Scenario
            """
            Feature: Add Scenario in Rule 
                Rule: I want Scenario
                    Scenario: A normal scenario
                        Given I am a Scenario step
            """
        When  I add a Scenario in Rule
            """
            Feature: Add Background in Rule 
                Rule: I want Scenario
                    Scenario: A normal scenario
                        Given I am a Scenario step
                    Scenario: Another scenario
                        Given I am another Scenario step
            """
        Then  vitest-cucumber add a Scenario in Rule

    Scenario: Remove Background in Rule
        Given Rule has two Scenario
            """
            Feature: Add Background in Rule 
                Rule: I want Scenario
                    Scenario: A normal scenario
                        Given I am a Scenario step
                    Scenario: Another scenario
                        Given I am another Scenario step
            """
        When  I remove a Scenario from Rule
            """
            Feature: Add Background in Rule 
                Rule: I want Scenario
                    Scenario: A normal scenario
                        Given I am a Scenario step
            """
        Then  vitest-cucumber remove a Scenario from Rule
