<p align="center">
<img src="https://vitest-cucumber.miceli.click/logo.png" width="100" />
</p>

# [vitest-cucumber](https://vitest-cucumber.miceli.click/)

## Overview

vitest-cucumber is an **opiniated** [vitest](https://vitest.dev/) **tools** (not a plugin) inspired by [jest-cucumber](https://github.com/bencompton/jest-cucumber).

Goal is to write unit test using Gherkin feature file and checking scenario name, missing scenario step etc.

## Installation

    npm install @amiceli/vitest-cucumber -D

It's enough you don't to add or update a config file.

Since `v3.4.4` vitest-cucumber required vitest `>=2.0.0`.

## Examples

You can take a look on [vitest-cucumber-example](https://github.com/amiceli/vitest-cucumber-example).

It's a Vue example project using **vitest-cucumber**.

## How it works

`Scenario` function use vitest `describe` function and all steps function like `Given`, `Then`
use vitest `test` function.

So you don't need to use `it` or `test` inside `Scenario` or scenario steps.

## Usage

First write your `feature` file. By example :

```feature
Feature: Search Bar
    Scenario: User wants to see all queried properties when querying 'Art-Canvas'
        Given the user is actively on the home-page
        When the user types 'Art-Canvas' in the search bar
        Then I should see a loading bar
        Then I should see all of the results under the search-bar
```

Now you can write unit tests with **vitest-cucumber**.

For example :

```typescript
import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature("path/to/my/file.feature");

describeFeature(feature, ({ Scenario }) => {
  Scenario(
    "User wants to see all queried properties when querying Art-Canvas",
    ({ Given, When, Then, And }) => {
      Given("the user is actively on the home-page ", () => {
        //logic to set up home-page
      });
      When("the user types Art-Canvas in the search bar", () => {
        //write logic to simulate typing
      });
      Then("I should see a loading bar", () => {
        //write test to see loading bar
      }),
        Then("I should see all of the results under the search-bar ", () => {
          //write test to check results
        });
    }
  );
});
```

When you run your test with vitest, **vitest-cucumber** will check :

- if you forget a Scenario or a Scenario Outline
- if you use correct Scenario description
- if you forgot a Scenario step
- if you use a wrong Scenario step type
- missing variables value in Scenario Outline
- missing variables name in Scenario Outline steps

For example, if you forgot to write :

```typescript
When("I run my unit tests", () => {
  // ...
});
```

It will throw **When I run my unit tests was not called**.

### Hooks

All hooks are optionnal.

```typescript
describeFeature(
  feature,
  ({
    AfterAllScenarios,
    AfterEachScenario,
    BeforeAllScenarios,
    BeforeEachScenario,
    Scenario,
  }) => {
    BeforeAllScenarios(() => {});
    BeforeEachScenario(() => {});
    AfterEachScenario(() => {});
    AfterAllScenarios(() => {});
  }
);
```

BeforeAllScenarios:
BeforeAllScenarios is run one time when describeFeature start. It’s like a beforeAll.

```typescript
beforeEach(() => {
  //before each test, call render Data to be used in later
  globalData = renderData(someComponent);
});
```

### Generate spec file from feature file

Since `3.4.1` vitest-cucumber provide a script to generate spec file from feature file.

You can use it like this :

    npx @amiceli/vitest-cucumber <path-to-feature> <path-to-spec>

An example :

    npx @amiceli/vitest-cucumber features/example.feature src/__tests__/example.spec.ts

You just have to format spec file after this script ;).

Currently it generates `TS` file, if you need more options open an issue ;).

## [Docs](https://vitest-cucumber.miceli.click/)

- [Background](https://vitest-cucumber.miceli.click/features/background)
- [Scenario](https://vitest-cucumber.miceli.click/features/scenario)
- [Scenario Outline and Examples](https://vitest-cucumber.miceli.click/features/scenario-outline)
- [Rule](https://vitest-cucumber.miceli.click/features/rule)
- [Scneario hooks](https://vitest-cucumber.miceli.click/features/hooks)
- [Step sequentially and async](https://vitest-cucumber.miceli.click/features/sequentially-and-async)
- [Gherkin tags](https://vitest-cucumber.miceli.click/features/gherkin-tags)
- [Step with expression / parameter type](https://vitest-cucumber.miceli.click/features/step-expression)
- [DocStrings](https://vitest-cucumber.miceli.click/features/doc-strings)
- [Spoken languages](https://vitest-cucumber.miceli.click/features/spoken-languages)

Doc is maintain in this project [vitest-cucumber-docs](https://github.com/amiceli/vitest-cucumber-docs).

Don't hesitate to open an issue on it if you want more details ;).
