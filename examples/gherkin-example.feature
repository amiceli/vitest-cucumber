Feature: Home page listing all channels

    Scenario: User on home page
        Given User on home channels page
        Then  I see all channels

    Scenario Outline: User loved channels
        Given User on home page
        When  I click on heart icon for <channel-name>
        Then  I see full heart icon
        And   I can see <channel-name> on "loved channels" page

        Examples:
            | channel-name |
            | TF1          |
            | M6           |

    Scenario Outline: Hide hidden channels
        Given User chose to hide <channel-name>
        When  I go to home page
        Then  I see all channels
        But   I don't see <channel-name>

        Examples:
            | channel-name |
            | France2      |
            | France3      |
