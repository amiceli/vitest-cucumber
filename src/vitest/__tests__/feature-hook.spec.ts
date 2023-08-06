import { loadFeature } from '../load-feature'
import { describeFeature } from '../describe-feature'
import {
    expect, vi, test, beforeEach,
} from 'vitest'

const feature = await loadFeature(`src/vitest/__tests__/minimal.feature`)

vi.mock(`vitest`, async () => {
    const mod = await vi.importActual<
    typeof import('vitest')
    >(`vitest`)

    return {
        ...mod,
        test : (s: string, fn: () => void) => {
            fn()
        },
        describe : (s: unknown, fn: () => void) => {
            fn()
            return {
                on : (title: string, f: () => void) => {
                    f()
                },
            }
        },
    }
})

beforeEach(() => {
    vi.clearAllMocks()
})

test(`BeforeEachScenario called before each scenario`, () => {
    expect(
        () => {
            describeFeature(
                feature,
                ({ BeforeEachScenario, Scenario }) => {
                    let example = false
                    const debug = vi.spyOn(console, `debug`).mockImplementation(() => {})

                    BeforeEachScenario(() => {
                        example = true
                        console.debug(`BeforeEachScenario`)
                    })

                    Scenario(`vitest-cucumber hook`, ({ Given }) => {
                        Given(`Scenario Hook`, () => {
                            expect(example).toBeTruthy()
                            expect(debug).toHaveBeenCalledWith(`BeforeEachScenario`)
                            example = false
                        })
                    })

                    Scenario(`vitest-cucumber hook again`, ({ Given }) => {
                        Given(`Scenario Hook Again`, () => {
                            expect(example).toBeTruthy()
                            expect(debug).toHaveBeenCalledTimes(2)
                        })
                    })
                },
            )
        },
    ).not.toThrowError()
})

test(`BeforeAllScenarios should be called one time after all scenarios`, () => {
    describeFeature(
        feature,
        ({ Scenario, BeforeAllScenarios }) => {
            const info = vi.spyOn(console, `info`).mockImplementation(() => {})

            BeforeAllScenarios(() => {
                console.info(`before all scenario`)
            })

            Scenario(`vitest-cucumber hook`, ({ Given }) => {
                Given(`Scenario Hook`, () => {
                    expect(info).toHaveBeenCalledWith(`before all scenario`)
                })
            })

            Scenario(`vitest-cucumber hook again`, ({ Given }) => {
                Given(`Scenario Hook Again`, () => {
                    expect(info).toHaveBeenCalledTimes(1)
                })
            })
        },
    )
})

test(`AfterEachScenario called after each scenario`, () => {
    describeFeature(
        feature,
        ({ Scenario, AfterEachScenario }) => {
            let count = 0

            AfterEachScenario(() => {
                count += 1
            })

            Scenario(`vitest-cucumber hook`, ({ Given }) => {
                Given(`Scenario Hook`, () => {
                    expect(count).toEqual(0)
                })
            })

            Scenario(`vitest-cucumber hook again`, ({ Given }) => {
                Given(`Scenario Hook Again`, () => {
                    expect(count).toEqual(1)
                })
            })
        },
    )
})

test(`AfterAllScenarios called one time after all scenario`, () => {
    describeFeature(
        feature, 
        ({ Scenario, AfterAllScenarios }) => {
            const info = vi.spyOn(console, `info`).mockImplementation(() => {})

            AfterAllScenarios(() => {
                expect(info).toHaveBeenCalledTimes(2)
                expect(info).toHaveBeenCalledWith(`inside scenario 1`)
                expect(info).toHaveBeenCalledWith(`inside scenario 2`)
            })

            Scenario(`vitest-cucumber hook`, ({ Given }) => {
                Given(`Scenario Hook`, () => {
                    console.info(`inside scenario 1`)
                    expect(true).toBeTruthy()
                })
            })

            Scenario(`vitest-cucumber hook again`, ({ Given }) => {
                Given(`Scenario Hook Again`, () => {
                    console.info(`inside scenario 2`)
                    expect(true).toBeTruthy()
                })
            })
        },
    )
})