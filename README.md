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

When you will run your test with vitest, **vitest-cucumber** will : 

- detect if your forget a Scenario
- check if you use correct Scenario description
- check if your forgot a Scenario step
- check if you use a wrong Scenario step type

For example, if you forgot to write : 

~~~typescript
When('I run my unit tests', () => {
    // ...
})
~~~

It will throw **When I run my unit tests was not called**.

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
