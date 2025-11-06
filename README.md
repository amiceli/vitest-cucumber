<p align="center">
<img src="https://vitest-cucumber.miceli.click/_astro/logo.xz4thweI_1zN7IX.webp" width="100" />
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

You can take a look on :

- [vitest-cucumber-example](https://github.com/amiceli/vitest-cucumber-example). Is a `Vue` project example.
- [vitest-cucumber_rtl_template](https://github.com/Agriculture-Intelligence/vitest-cucumber_rtl_template). Is a `React` project example.

## How it works

`Scenario` function use vitest `describe` function and all steps function like `Given`, `Then`
use vitest `test` function.

So you don't need to use `it` or `test` inside `Scenario` or scenario steps.

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

Since `3.4.1` vitest-cucumber provide a script to generate spec file from feature file.

You can use it like this :

    npx @amiceli/vitest-cucumber --feature <path-to-feature> --space <path-to-spec> --lang <lang:optional>

An example :

    npx @amiceli/vitest-cucumber --feature features/example.feature --spec src/__tests__/example.spec.ts --lang fr

You just have to format spec file after this script ;).

Currently it generates `TS` file, if you need more options open an issue ;).

`lang` allow to specify which lang is used in feature file.
Required if you don't use `en` language.

## [Docs](https://vitest-cucumber.miceli.click/)

- [Configuration](https://vitest-cucumber.miceli.click/configuration)
- [Vitest plugin to sync spec and feature files](https://vitest-cucumber.miceli.click/plugin)
- [Background](https://vitest-cucumber.miceli.click/features/background)
- [Scenario](https://vitest-cucumber.miceli.click/features/scenario)
- [Scenario Outline and Examples](https://vitest-cucumber.miceli.click/features/scenario-outline)
- [Scenario Outline mapped examples](https://vitest-cucumber.miceli.click/features/mapped-examples/)
- [Rule](https://vitest-cucumber.miceli.click/features/rule)
- [Scneario hooks](https://vitest-cucumber.miceli.click/features/hooks)
- [Structure hooks](https://vitest-cucumber.miceli.click/features/structure-context)
- [Predefine steps](https://vitest-cucumber.miceli.click/features/predefine-steps)
- [`skip`, `only` with scenario, rule and background](https://vitest-cucumber.miceli.click/features/skip-only)
- [Step sequentially and async](https://vitest-cucumber.miceli.click/features/sequentially-and-async)
- [Gherkin tags](https://vitest-cucumber.miceli.click/features/gherkin-tags)
- [Step with expression / parameter type](https://vitest-cucumber.miceli.click/features/step-expression)
- [DocStrings](https://vitest-cucumber.miceli.click/features/doc-strings)
- [DataTables](https://vitest-cucumber.miceli.click/features/data-tables)
- [Spoken languages](https://vitest-cucumber.miceli.click/features/spoken-languages)
- [Tests without feature file](https://vitest-cucumber.miceli.click/features/define-feature)

Doc is maintain in this project [vitest-cucumber-docs](https://github.com/amiceli/vitest-cucumber-docs).

Don't hesitate to open an issue on it if you want more details ;).
