Feature: update Rule in Feature

    Background:
        Given My feature file is "src/__tests__/awesome.feature"
        And   My spec file is "src/__tests__/awesome.spec.ts"

    Scenario: Add Rule in Feautre 
        Given Feature has one Rule
            """
            Feature: I love Scenario
                Rule: first rule
                    Scenario: A rule scenario
                        Given I am a Scenario step
            """
        When  I add a Scenario in Feature
            """
            Feature: I love Scenario
                Rule: first rule
                    Scenario: A rule scenario
                        Given I am a Scenario step
                Rule: second rule
                    Scenario: Another rule scenario
                        Given I am a another Scenario step
            """
        Then  vitest-cucumber add a Rule in Feature

    Scenario: Remove Rule in Feature
        Given Feature has two Rule
            """
            Feature: I love Scenario
                Rule: first rule
                    Scenario: A rule scenario
                        Given I am a Scenario step
                Rule: second rule
                    Scenario: Another rule scenario
                        Given I am a another Scenario step
            """
        When  I remove Rule from Feature
            """
            Feature: I love Scenario
                Rule: first rule
                    Scenario: A rule scenario
                        Given I am a Scenario step
            """
        Then  vitest-cucumber remove Rule from Feature
