# vitest-cucumber

vitest-cucumber is a [vitest](https://vitest.dev/) tools inspired by [jest-cucumber](https://github.com/bencompton/jest-cucumber).

Goal is to write unit test using Gherkin feature file and checking scenario name, missing scenario step etc.

## Installation

    npm install @amiceli/vitest-cucumber -D

## Usage

First write your feature like. By example : 

~~~feature
Feature: Improve my unit tests
    Scenario: Use vitest-cucumber in my unit tests
        Given Developer using feature file
        And   Using vitest-cucumber
        When  I run my unit tests
        Then  I know if I forgot a scenario
~~~

Now you can write unit tests with **vitest-cucumber**.

Foe example : 

~~~typescript
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'

const feature = await loadFeature('path/to/my/file.feature')

describeFeature(feature, ({ Scenario }) => {
            
    Scenario('Use vitest-cucumber in my unit tests', ({ Given, When, Then, And }) => {
        Given('Developer using feature file', () => {
            expect(false).toBeFalsy()
        })
        And('sing vitest-cucumber', () => {
            // ...
        })
        When('I run my unit tests', () => {
            // ...
        })
        Then('I know if I forgot a scenario', () => {
            // ...
        })
    })

})
~~~

When you will run your test with vitest, **vitest-cucumber** will check : 

- if you forget a Scenario or a Scenario Outline
- if you use correct Scenario description
- if you forgot a Scenario step
- if you use a wrong Scenario step type
- missing variables value in Scenario Outline
- missing variables name in Scenario Outline steps

For example, if you forgot to write : 

~~~typescript
When('I run my unit tests', () => {
    // ...
})
~~~

It will throw **When I run my unit tests was not called**.

### Scenario Outline and Examples

An example of feature file with Scenario Outline and Examples : 

~~~
Feature: Detect image ratio from width and height

    Scenario Outline: Detect image ratio when upload image
        Given As a user in an awesome project
        When  I upload an image <width>px on <height>px
        Then  I see my image <ratio>

        Examples:
            | width | height | ratio |
            | 100   | 100    | 1     |
            | 150   | 300    | 2     |

~~~

You can use variables in your ScenarioOutline callback.
A ScenarioOutline is executed X times according to X variables.

~~~typescript
describeFeature(feature, ({ ScenarioOutline }) => {

    ScenarioOutline(`Detect image ratio when upload image`, ({ Given, When, Then }, variables) =>{
        Given(`As a user in an awesome project`, () => {})
        When(` I upload an image <width>px on <height>px`, () => {
            // varaibles.width can be 100 or 150
            // varaibles.height can be 100 or 300
            // varaibles.ratio can be 1 or 2
        })
        Then(`I see my image <ratio>`, () => { })
    })
})
~~~

For example, first time variables are : 

~~~json
{
    "width": 100,
    "height": 100,
    "ratio": 1,
}
~~~

And next test : 

~~~json
{
    "width": 150,
    "height": 300,
    "ratio": 2,
}
~~~


### Scenario hooks

Gherkin provide some [scenario hooks](https://cucumber.io/docs/cucumber/api/?lang=java#hooks).

vitest-gherkin provides : 

- `BeforeEachScenario` like `beforeEach`, before each Scenario
- `BeforeAllScenarios` like`beforeAll`, before all scenarios
- `AfterEachScenario` like `afterEach`, after each scenario
- `AfterAllScenarios` like `afterAll`, after all Scenario

All hooks should be called before `Scenario` : 

~~~typescript
describeFeature(
    feature,
    ({ AfterAllScenarios, AfterEachScenario, BeforeAllScenarios, BeforeEachScenario, Scenario }) => {
        BeforeAllScenarios(() => {
            // ...
        })
        BeforeEachScenario(() => {
            // ...
        })
        AfterEachScenario(() => {
            // ...
        })
        AfterAllScenarios(() => {
            // ...
        })
        Scenario(`vitest-cucumber hook`, ({ Given }) => {
            // ...
        })
        Scenario(`vitest-cucumber hook again`, ({ Given }) => {
            // ...
        })
    }
)
~~~

### Many Feature(s)

If in your feature file you have more than 1 feature.
**vitest-cucumber** can load all feature with `loadFeature` : 

~~~ts
import { loadFeatures, describeFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'

const [
    firstFeature, secondFeature
] = await loadFeatures('path/to/my/file.feature')

describeFeature(firstFeature, ({ Scenario }) => {
    // ...
})

describeFeature(secondFeature, ({ Scenario }) => {
    // ...
})
~~~

### How it works

`Scenario` function use vitest `describe` function and all steps function like `Given`, `Then`
use vitest `test` function.

So you don't need to use `it` or `test` inside `Scenario` or scenario steps.
