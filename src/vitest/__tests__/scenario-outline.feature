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
        And   I add <test>, <again> variables
        But   I forgot to set values
        Then  I have an error

        Examples:
            | test | again |

Feature: Scenario Outline with missing examples keyword

    Scenario Outline: Scenario without examples keyword
        Given I run this scenario outline
        And   I forgot Examples keyword before variables
        Then  I have an error

        | foo | bar |
        | 1 | 2 |
