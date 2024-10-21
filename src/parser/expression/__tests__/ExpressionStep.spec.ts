import { describe, expect, it } from 'vitest'
import { StepExpressionMatchError } from '../../../errors/errors'
import { Step, StepTypes } from '../../models/step'
import { ExpressionStep } from '../ExpressionStep'

describe(`ExpressionStep`, () => {
    describe('{boolean}', () => {
        it(`should match {boolean}`, () => {
            const step = new Step(StepTypes.GIVEN, `This information is true`)
            const params = ExpressionStep.matchStep(
                step,
                `This information is {boolean}`,
            )
            expect(params).toEqual([true])
        })

        it(`should match multiple {boolean}`, () => {
            const step = new Step(StepTypes.GIVEN, `Is it true or false?`)
            const params = ExpressionStep.matchStep(
                step,
                `Is it {boolean} or {boolean}?`,
            )
            expect(params).toEqual([true, false])
        })

        it(`should not match {boolean} that start with expected keyword`, () => {
            const step = new Step(StepTypes.GIVEN, `This information is truely`)
            expect(() =>
                ExpressionStep.matchStep(step, `This information is {boolean}`),
            ).toThrowError(
                new StepExpressionMatchError(
                    step,
                    `This information is {boolean}`,
                ),
            )
        })
    })

    describe('{word}', () => {
        it(`should match {word}`, () => {
            const step = new Step(StepTypes.GIVEN, `This is a special reward`)
            const params = ExpressionStep.matchStep(
                step,
                `This is a {word} reward`,
            )
            expect(params).toEqual([`special`])
        })

        it(`should match multiple {word}`, () => {
            const step = new Step(StepTypes.GIVEN, `Either a book or a movie`)
            const params = ExpressionStep.matchStep(
                step,
                `Either a {word} or a {word}`,
            )
            expect(params).toEqual([`book`, `movie`])
        })
    })

    describe('{char}', () => {
        it(`should match {char}`, () => {
            const step = new Step(StepTypes.GIVEN, `I got an A grade`)
            const params = ExpressionStep.matchStep(
                step,
                `I got an {char} grade`,
            )
            expect(params).toEqual([`A`])
        })

        it(`should match multiple {char}`, () => {
            const step = new Step(
                StepTypes.GIVEN,
                `A grade between A and C is required to pass the exam`,
            )
            const params = ExpressionStep.matchStep(
                step,
                `A grade between {char} and {char} is required to pass the exam`,
            )
            expect(params).toEqual([`A`, `C`])
        })

        it(`should match {char} inside a word`, () => {
            const step = new Step(
                StepTypes.GIVEN,
                `should be the 7th char of the word "Alphabet"`,
            )
            const params = ExpressionStep.matchStep(
                step,
                `should be the 7th char of the word "Alphab{char}t"`,
            )
            expect(params).toEqual([`e`])
        })

        it(`should match consecutive {char}`, () => {
            const step = new Step(StepTypes.GIVEN, `ATCG`)
            const params = ExpressionStep.matchStep(
                step,
                `{char}{char}{char}{char}`,
            )
            expect(params).toEqual([`A`, `T`, `C`, `G`])
        })
    })

    describe('{string}', () => {
        it(`should match {string}`, () => {
            const step = new Step(StepTypes.GIVEN, `I love 'Vue'`)
            const params = ExpressionStep.matchStep(step, `I love {string}`)
            expect(params).toEqual([`Vue`])
        })

        it(`should match multiple {string}`, () => {
            const step = new Step(StepTypes.GIVEN, `I love 'Vue' for "web"`)
            const params = ExpressionStep.matchStep(
                step,
                `I love {string} for {string}`,
            )
            expect(params).toEqual([`Vue`, `web`])
        })
    })

    describe('{email}', () => {
        it(`should match {email}`, () => {
            const step = new Step(
                StepTypes.GIVEN,
                `This message will be sent to john.smith@example.com`,
            )
            const params = ExpressionStep.matchStep(
                step,
                `This message will be sent to {email}`,
            )
            expect(params).toEqual([`john.smith@example.com`])
        })

        it(`should match multiple {email}`, () => {
            const step = new Step(
                StepTypes.GIVEN,
                `This message will be sent to john.smith@example.com and jane.doe@example.com`,
            )
            const params = ExpressionStep.matchStep(
                step,
                `This message will be sent to {email} and {email}`,
            )
            expect(params).toEqual([
                `john.smith@example.com`,
                `jane.doe@example.com`,
            ])
        })
    })

    describe('{int}', () => {
        it(`should match {int}`, () => {
            const step = new Step(StepTypes.GIVEN, `I love Vue 3`)
            const params = ExpressionStep.matchStep(step, `I love Vue {int}`)
            expect(params).toEqual([3])
        })

        it(`should match multiple {int}`, () => {
            const step = new Step(StepTypes.GIVEN, `I love Vue 2 or 3`)
            const params = ExpressionStep.matchStep(
                step,
                `I love Vue {int} or {int}`,
            )
            expect(params).toEqual([2, 3])
        })

        it(`should fail to match {int}`, () => {
            const step = new Step(StepTypes.GIVEN, `I love Vue 3.1`)

            expect(() => {
                ExpressionStep.matchStep(step, `I love Vue {int}`)
            }).toThrowError(
                new StepExpressionMatchError(step, `I love Vue {int}`),
            )
        })

        it(`should match negative {int}`, () => {
            const step = new Step(StepTypes.GIVEN, `It is cold. -14°C`)
            const params = ExpressionStep.matchStep(step, `It is cold. {int}°C`)
            expect(params).toEqual([-14])
        })
    })

    describe('{number}', () => {
        it(`should match {number}`, () => {
            const step = new Step(StepTypes.GIVEN, `I love Vue 3.1`)
            const params = ExpressionStep.matchStep(step, `I love Vue {number}`)
            expect(params).toEqual([3.1])
        })

        it(`should match multiple {number}`, () => {
            const step = new Step(StepTypes.GIVEN, `I love Vue 3.1 or 3.2`)
            const params = ExpressionStep.matchStep(
                step,
                `I love Vue {number} or {number}`,
            )
            expect(params).toEqual([3.1, 3.2])
        })

        it(`should match integer {number}`, () => {
            const step = new Step(StepTypes.GIVEN, `I love Vue 3`)
            const params = ExpressionStep.matchStep(step, `I love Vue {number}`)
            expect(params).toEqual([3])
        })

        it(`should match negative {number}`, () => {
            const step = new Step(StepTypes.GIVEN, `It is cold. -4.73°C`)
            const params = ExpressionStep.matchStep(
                step,
                `It is cold. {number}°C`,
            )
            expect(params).toEqual([-4.73])
        })
    })

    describe('{date}', () => {
        describe('MM/DD/YYYY format', () => {
            it(`should match {date}`, () => {
                const step = new Step(
                    StepTypes.GIVEN,
                    `the order was created at 12/01/2022`,
                )
                const params = ExpressionStep.matchStep(
                    step,
                    `the order was created at {date}`,
                )
                expect(params).toEqual([new Date(2022, 11, 1)])
            })

            it(`should match multiple {date}`, () => {
                const step = new Step(
                    StepTypes.GIVEN,
                    `You should place your order between 01/01/2023 and 12/12/2023`,
                )
                const params = ExpressionStep.matchStep(
                    step,
                    `You should place your order between {date} and {date}`,
                )
                expect(params).toEqual([
                    new Date(2023, 0, 1),
                    new Date(2023, 11, 12),
                ])
            })
        })

        describe('YYYY-MM-DD format', () => {
            // 💡 this format acts as UTC timezone

            it(`should match {date}`, () => {
                const step = new Step(
                    StepTypes.GIVEN,
                    `the order was created at 2022-12-01`,
                )
                const params = ExpressionStep.matchStep(
                    step,
                    `the order was created at {date}`,
                )
                expect(params).toEqual([new Date(Date.UTC(2022, 11, 1))])
            })

            it(`should match multiple {date}`, () => {
                const step = new Step(
                    StepTypes.GIVEN,
                    `You should place your order between 2023-01-01 and 2023-12-12`,
                )
                const params = ExpressionStep.matchStep(
                    step,
                    `You should place your order between {date} and {date}`,
                )
                expect(params).toEqual([
                    new Date(Date.UTC(2023, 0, 1)),
                    new Date(Date.UTC(2023, 11, 12)),
                ])
            })
        })

        describe('MM/DD/YYYY HH:MM:SS format', () => {
            it(`should match {date}`, () => {
                const step = new Step(
                    StepTypes.GIVEN,
                    `The log was created at 05/23/2017 15:02:27`,
                )
                const params = ExpressionStep.matchStep(
                    step,
                    `The log was created at {date}`,
                )
                expect(params).toEqual([new Date(2017, 4, 23, 15, 2, 27)])
            })
        })

        describe('YYYY-MM-DD with time format', () => {
            it(`should match {date}`, () => {
                const step = new Step(
                    StepTypes.GIVEN,
                    `The log was created at 2017-05-23T15:02:27`,
                )
                const params = ExpressionStep.matchStep(
                    step,
                    `The log was created at {date}`,
                )
                expect(params).toEqual([new Date(2017, 4, 23, 15, 2, 27)])
            })

            it(`should match {date} with UTC timezone`, () => {
                const step = new Step(
                    StepTypes.GIVEN,
                    `The log was created at 2017-05-23T15:02:27Z`,
                )
                const params = ExpressionStep.matchStep(
                    step,
                    `The log was created at {date}`,
                )
                expect(params).toEqual([
                    new Date(Date.UTC(2017, 4, 23, 15, 2, 27)),
                ])
            })
        })
    })

    describe('{currency}', () => {
        it(`should match {currency}`, () => {
            const step = new Step(StepTypes.GIVEN, `I have $200 in the bank`)
            const params = ExpressionStep.matchStep(
                step,
                `I have {currency} in the bank`,
            )
            const parsedValue = {
                currency: '',
                decimalSeparator: '',
                decimals: '',
                groupSeparator: '',
                integer: '200',
                raw: '$200',
                sign: '',
                symbol: '$',
                value: 200,
            }

            expect(params).toEqual([parsedValue])
        })

        it(`should match multiple {number}`, () => {
            const step = new Step(StepTypes.GIVEN, `This item costs $2.5 or 3€`)
            const params = ExpressionStep.matchStep(
                step,
                `This item costs {currency} or {currency}`,
            )

            const parsedValue1 = {
                currency: '',
                decimalSeparator: '.',
                decimals: '.5',
                groupSeparator: '',
                integer: '2',
                raw: '$2.5',
                sign: '',
                symbol: '$',
                value: 2.5,
            }
            const parsedValue2 = {
                currency: '',
                decimalSeparator: '',
                decimals: '',
                groupSeparator: '',
                integer: '3',
                raw: '3€',
                sign: '',
                symbol: '€',
                value: 3,
            }

            expect(params).toEqual([parsedValue1, parsedValue2])
        })

        it(`should match negative {currency}`, () => {
            const step = new Step(StepTypes.GIVEN, `I have -$50 in the bank`)
            const params = ExpressionStep.matchStep(
                step,
                `I have {currency} in the bank`,
            )
            const parsedValue = {
                currency: '',
                decimalSeparator: '',
                decimals: '',
                groupSeparator: '',
                integer: '-50',
                raw: '-$50',
                sign: '-',
                symbol: '$',
                value: -50,
            }

            expect(params).toEqual([parsedValue])
        })
    })

    describe('{list}', () => {
        it(`should match {list}`, () => {
            const step = new Step(
                StepTypes.GIVEN,
                `I use React, Astro, TypeScript`,
            )
            const params = ExpressionStep.matchStep(step, `I use {list}`)
            const expectedList = ['React', 'Astro', 'TypeScript']

            expect(params).toEqual([expectedList])
        })

        it(`should match multiple {list}`, () => {
            const step = new Step(
                StepTypes.GIVEN,
                `I use React, Astro, TypeScript and I also use Vue, Svelte, Angular`,
            )
            const params = ExpressionStep.matchStep(
                step,
                `I use {list} and I also use {list}`,
            )
            const expectedList1 = ['React', 'Astro', 'TypeScript']
            const expectedList2 = ['Vue', 'Svelte', 'Angular']

            expect(params).toEqual([expectedList1, expectedList2])
        })
    })

    describe('{}', () => {
        it(`should match {}`, () => {
            const step = new Step(
                StepTypes.GIVEN,
                `should catch the rest of the string`,
            )
            const params = ExpressionStep.matchStep(step, `should catch {}`)

            expect(params).toEqual([`the rest of the string`])
        })
    })

    describe('{any}', () => {
        it(`should match {}`, () => {
            const step = new Step(
                StepTypes.GIVEN,
                `should catch the rest of the string`,
            )
            const params = ExpressionStep.matchStep(step, `should catch {any}`)

            expect(params).toEqual([`the rest of the string`])
        })
    })

    it(`should match both {string} and {number}`, () => {
        const step = new Step(StepTypes.GIVEN, `I love "Vue" 3 and 12`)
        const params = ExpressionStep.matchStep(
            step,
            `I love {string} {number} and {number}`,
        )
        expect(params).toEqual([`Vue`, 3, 12])
    })

    it(`should detect wrong expression`, () => {
        const step = new Step(StepTypes.GIVEN, `I love "Vue" 3`)

        expect(() => {
            ExpressionStep.matchStep(step, `I love {number} 3`)
        }).toThrowError(new StepExpressionMatchError(step, `I love {number} 3`))
    })

    it(`should detect step without expression`, () => {
        const step = new Step(StepTypes.GIVEN, `I love "Vue" 3`)
        const params = ExpressionStep.matchStep(step, `I love "Vue" 3`)

        expect(params).toEqual([])
    })

    it(`should match full step expression`, () => {
        const step = new Step(StepTypes.GIVEN, `I love "Vue" 3.2`)

        expect(() => {
            ExpressionStep.matchStep(step, `I love "Vue" {char}`)
        }).toThrowError(
            new StepExpressionMatchError(step, `I love "Vue" {char}`),
        )
    })
})
