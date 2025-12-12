Feature: defineSteps with Expression Parameters

    Scenario: Test string parameter extraction
        Given a workspace "Test Workspace" exists
        When I create a project "Demo Project"
        Then the project "Demo Project" should exist

    Scenario: Test number parameter extraction
        Given I have 5 items
        When I add 3 more items
        Then I should have 8 items

    Scenario Outline: Test expression parameters with outline
        Given a workspace "<workspace>" exists
        When I create a project "<project>"
        Then the project "<project>" should exist

        Examples:
            | workspace      | project       |
            | Test Workspace | Demo Project  |
