import { loadFeature } from '../load-feature'
import { describeFeature } from '../describe-feature'
import {
    expect, vi, test, beforeEach,
} from 'vitest'
import { Feature } from '../../parser/feature'

let feature: Feature

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

beforeEach(async () => {
    vi.clearAllMocks()
    feature = await loadFeature(`src/vitest/__tests__/minimal.feature`)
})

test(`BeforeEachScenario called before each scenario`, () => {
    expect(
        () => {
            describeFeature(
                feature,
                ({ BeforeEachScenario, Scenario }) => {
                    let example = false
                    const debug = vi.spyOn(console, `debug`).mockImplementation(() => { })

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
                        Given(`Scenario Hook again`, () => {
                            expect(example).toBeTruthy()
                            expect(debug).toHaveBeenCalledTimes(2)
                        })
                    })
                },
            )
        },
    ).not.toThrowError()
})

test(`BeforeEachScenario should be called before Scenario`, () => {
    expect(
        () => {
            describeFeature(
                feature,
                ({ BeforeEachScenario, Scenario }) => {

                    Scenario(`vitest-cucumber hook`, ({ Given }) => {
                        Given(`Scenario Hook`, () => { })
                    })

                    BeforeEachScenario(() => { })
                },
            )
        },
    ).toThrowError(`BeforeEachScenario() should be called before Scenario()`)
})

// 

test(`BeforeAllScenarios should be called one time after all scenarios`, () => {
    describeFeature(
        feature,
        ({ Scenario, BeforeAllScenarios }) => {
            const info = vi.spyOn(console, `info`).mockImplementation(() => { })

            BeforeAllScenarios(() => {
                console.info(`before all scenario`)
            })

            Scenario(`vitest-cucumber hook`, ({ Given }) => {
                Given(`Scenario Hook`, () => {
                    expect(info).toHaveBeenCalledWith(`before all scenario`)
                })
            })

            Scenario(`vitest-cucumber hook again`, ({ Given }) => {
                Given(`Scenario Hook again`, () => {
                    expect(info).toHaveBeenCalledTimes(1)
                })
            })
        },
    )
})

test(`BeforeAllScenarios should be called before Scenario`, () => {
    expect(
        () => {
            describeFeature(
                feature,
                ({ BeforeAllScenarios, Scenario }) => {

                    Scenario(`vitest-cucumber hook`, ({ Given }) => {
                        Given(`Scenario Hook`, () => { })
                    })

                    BeforeAllScenarios(() => { })
                },
            )
        },
    ).toThrowError(`BeforeAllScenarios() should be called before Scenario()`)
})

// 

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
                Given(`Scenario Hook again`, () => {
                    expect(count).toEqual(1)
                })
            })
        },
    )
})

test(`AfterEachScenario should be called before Scenario`, () => {
    expect(
        () => {
            describeFeature(
                feature,
                ({ AfterEachScenario, Scenario }) => {

                    Scenario(`vitest-cucumber hook`, ({ Given }) => {
                        Given(`Scenario Hook`, () => { })
                    })

                    AfterEachScenario(() => { })
                },
            )
        },
    ).toThrowError(`AfterEachScenario() should be called before Scenario()`)
})

// 

test(`AfterAllScenarios called one time after all scenario`, () => {
    describeFeature(
        feature,
        ({ Scenario, AfterAllScenarios }) => {
            const info = vi.spyOn(console, `info`).mockImplementation(() => { })

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
                Given(`Scenario Hook again`, () => {
                    console.info(`inside scenario 2`)
                    expect(true).toBeTruthy()
                })
            })
        },
    )
})

test(`AfterAllScenarios should be called before Scenario`, () => {
    expect(
        () => {
            describeFeature(
                feature,
                ({ AfterAllScenarios, Scenario }) => {

                    Scenario(`vitest-cucumber hook`, ({ Given }) => {
                        Given(`Scenario Hook`, () => { })
                    })

                    AfterAllScenarios(() => { })
                },
            )
        },
    ).toThrowError(`AfterAllScenarios() should be called before Scenario()`)
})

// 

test(`Everything is OK`, () => {
    expect(
        () => {
            describeFeature(
                feature,
                ({ AfterAllScenarios, AfterEachScenario, BeforeAllScenarios, BeforeEachScenario, Scenario }) => {
                    let count = 0

                    BeforeAllScenarios(() => {
                        expect(count).toEqual(0)
                    })

                    BeforeEachScenario(() => {
                        count += 1
                    })

                    AfterEachScenario(() => {
                        count += 2
                    })

                    AfterAllScenarios(() => {
                        expect(count).toEqual(6)
                    })

                    Scenario(`vitest-cucumber hook`, ({ Given }) => {
                        Given(`Scenario Hook`, () => { 
                            expect(count).toEqual(1)
                        })
                    })

                    Scenario(`vitest-cucumber hook again`, ({ Given }) => {
                        Given(`Scenario Hook again`, () => { 
                            expect(count).toEqual(4)
                        })
                    })                    
                },
            )
        },
    ).not.toThrowError()
})
