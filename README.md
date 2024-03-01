# vitest-cucumber

vitest-cucumber is a [vitest](https://vitest.dev/) **tools** (not a plugin) inspired by [jest-cucumber](https://github.com/bencompton/jest-cucumber).

Goal is to write unit test using Gherkin feature file and checking scenario name, missing scenario step etc.

## Installation

    npm install @amiceli/vitest-cucumber -D

It's enough you don't to add or update a config file.

## Examples

In [examples](https://github.com/amiceli/vitest-cucumber/tree/docs/add-examples/examples) folder you can read tests using `vitest-cucumber` in a Vue project.

`vitest-cucumber` isn't only for Vue, it's just an example ;).

## Usage

First write your `feature` file. By example : 

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

When you run your test with vitest, **vitest-cucumber** will check : 

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

### Generate spec file from feature file

Since `3.2.2` vitest-cucumber provide a script to generate spec file from feature file.

You can use it like this : 

    node node_modules/@amiceli/vitest-cucumber/scripts/cli-generate.cjs <path-to-feature> <path-to-spec>

An example : 

    node node_modules/@amiceli/vitest-cucumber/scripts/cli-generate.cjs features/example.feature src/__tests__/example.spec.ts

You just have to format spec file after this script ;).

Currently it generates `TS` file, if you need more options open an issue ;).

### describeFeature options

`describeFeature` allow optionnal options to ignore `Scenario`, `Scenario Outline`, `Rule` according a tag.

Gherkin example : 

~~~
Feature: detect uncalled rules
    @awesome
    Scenario: Me I am executed
        Given vitest-cucumber is running
        Then I am executed
    @another-tag
    Rule: executed rule
        Scenario: I am also executed
            Given vitest-cucumber is running
            Then  my parent rule is called
        @custom
        Scenario: Ignored scenario
            Given vitest-cucumber is running
            Then  I am ignored
~~~

An example, ignore Rule with `@another-tag` : 

~~~typescript
describeFeature(feautre, () => {
    // ...
}, { excludeTags : ['another-tag']}) // you can use many tags
~~~

This will ignore `Rule` and its `Scenario` / `Scenario Outline`.

### Scenario Outline and Examples

An example of feature file with `Scenario Outline` and `Examples` : 

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

You can use variables in your `ScenarioOutline` callback.
A `ScenarioOutline` is executed X times according to X variables.

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

### Rule

Since `3.0.0` version, **vitest-cucumber** allow to use `Rule`.

A feature file example with rules : 

~~~feature
Feature: Run tests with Rule
    Scenario: I'm feature's scenario
        Given I use vitest-cucumber
        Then  It know I come from a Feature

    Rule: I've specific Scenario
        Scenario: I'm rule's scenario
            Given I use vitest-cucumber
            Then  It know I come from a Rule
~~~

And you can use it in your test : 

~~~typescript
describeFeature(feature, ({ Rule, Scenario }) => {
    Scenario("I'm feature's scenario", () => {
        // ...
    })
    Rule(`I've specific Scenario`, ({ RuleScenario, RuleScenarioOutline }) =>{
        RuleScenario("I'm rule's scenario", () => {
            // ...
        })
    })
})
~~~

**IMPORTANT**: in your feature file, your feature `Scenario` must be written before rule `Scenario`.

If you write like this : 

~~~feature
Feature: Run tests with Rule
    Rule: I've specific Scenario
        Scenario: I'm rule's scenario
            Given I use vitest-cucumber
            Then  It know I come from a Rule
    Scenario: I'm feature's scenario
        Given I use vitest-cucumber
        Then  It know I come from a Feature
~~~

**vitest-cucumber** doesn't use indentation, is too complex for a little bring.

So In this case *I'm feature's scenario* `Scenario` is added to your Rule.
### For async and await

Steps can be asynchronous because they are executed sequentially.

But `Scenario` and `ScenarioOutline` are not asynchronous.

Depending on what you need to do you can use scenario hooks. 

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

If you use `Rule`, hooks are runned also in your `Rule`.

For example if you have a `Feature` with 2 `Rule`, `BeforeAllScenarios` is executed three times.

Currently I don't know if it's useful to split `Feature` hooks and `Rule` hooks ;).

### Steps are run sequentially

Since v2.0.0 `vitest-cucumber` use `test.each` instead of `test`.
To follow Gherkin way, steps are tested one after one.

An example Scenario : 

~~~ts
describeFeature(feature, ({ Scenario }) => {
    Scenario(`Run steps sequentially`, ({ Given, And, When, Then }) => {
        let count = 0
        Given(`Count equals 0`, () => {
            expect(count).toBe(0)
        })
        And(`I increase the count by 1 in a promise`, async () => {
            await new Promise((resolve) => {
                count++
                resolve(null)
            })
        })
        When(`I use a timeout to increase`, async () => {
            await new Promise((resolve) => {
                setTimeout(() => {
                    count++
                    resolve(null)
                }, 1000)
            })
        })
        Then(`At end count should be 2`, () => {
            expect(count).toBe(2)
        })
    })
})
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

You can still use `loadFeatures` but since v2.0.0 is deprecated.
Because multiple `Feature` in one gherkin file isn't recommended in Gherkin rules.

### How it works

`Scenario` function use vitest `describe` function and all steps function like `Given`, `Then`
use vitest `test` function.

So you don't need to use `it` or `test` inside `Scenario` or scenario steps.
