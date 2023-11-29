Feature: Scenario Outline without examples

    Scenario Outline: Scenario without examples
        Given I run this scenario outline
        And   I forgot to add examples
        Then  I have an error

Feature: Scenario Outline missing variables in step

    Scenario Outline: Missing examples variables in steps
        Given I run this scenario outline
        And  I add only <foo>
        Then I have an error

        Examples:
            | foo | bar |
            | 1   | 2   |

Feature: Scenario Outline missing variables values

    Scenario Outline: Missing value for variables in Examples
        Given I run this scenario outline
        And   I add <foo>, <bar> variables
        But   I forgot to set values
        Then  I have an error

        Examples:
            | foo | bar |
