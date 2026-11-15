import { expect } from 'vitest'
import { defineParameterExpression } from '../../parser/expression/custom'
import { describeFeature } from '../describe-feature'
import { loadFeatureFromText } from '../load-feature'

describe('Issue #280', () => {
    defineParameterExpression({
        name: 'intList',
        regexp: /\d+(?:,\d+)*/,
        transformer: (s) => s.split(',').map(Number),
    })

    const feature = loadFeatureFromText(`
Feature: Step expressions
  Scenario: parameters
    Given I buy 2 items: apple, pear
    And the ids are 1,2,3
    And mode is a|b with 5
`)

    describeFeature(feature, ({ Scenario }) => {
        Scenario('parameters', ({ Given, And }) => {
            Given(
                'I buy {int} items: {list}',
                (_, count: number, items: string[]) => {
                    expect(count).toBe(2)
                    expect(items).toEqual([
                        'apple',
                        'pear',
                    ])
                },
            )
            And('the ids are {intList}', (_, ids: number[]) => {
                expect(ids).toEqual([
                    1,
                    2,
                    3,
                ])
            })
            And('mode is a|b with {int}', (_, n: number) => {
                expect(n).toBe(5)
            })
        })
    })
})
