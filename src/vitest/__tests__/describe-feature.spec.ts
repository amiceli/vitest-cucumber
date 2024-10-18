import { beforeEach } from 'node:test'
import { afterAll, beforeAll, describe, expect, vi } from 'vitest'
import { FeatureContentReader } from '../../__mocks__/FeatureContentReader.spec'
import {
    BackgroundNotCalledError,
    BackgroundNotExistsError,
    FeatureUknowRuleError,
    FeatureUknowScenarioError,
    IsScenarioOutlineError,
    NotScenarioOutlineError,
    RuleNotCalledError,
    ScenarioNotCalledError,
    StepAbleStepsNotCalledError,
    StepAbleUnknowStepError,
} from '../../errors/errors'
import { Rule as RuleType } from '../../parser/models/Rule'
import { Scenario as ScenarioType } from '../../parser/models/scenario'
import { Step, StepTypes } from '../../parser/models/step'
import { setVitestCucumberConfiguration } from '../configuration'
import { describeFeature } from '../describe-feature'

describe(`Feature`, () => {
    describe(`should detect uncalled Rule`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Rule: simple rule`,
            `      Scenario: Simple scenario`,
            `          Given vitest-cucumber is running`,
            `          Then  check if I am called`,
        ]).parseContent()

        afterAll(() => {
            expect(feature.rules[0].isCalled).toBe(false)
        })

        expect(() => {
            describeFeature(feature, () => {})
        }).toThrowError(new RuleNotCalledError(feature.rules[0]))
    })
    describe(`should detect if rule exists`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Rule: simple rule`,
            `      Scenario: Simple scenario`,
            `          Given vitest-cucumber is running`,
            `          Then  check if I am called`,
        ]).parseContent()

        expect(() => {
            describeFeature(feature, (f) => {
                f.Rule(`another`, () => {})
            })
        }).toThrowError(
            new FeatureUknowRuleError(feature, new RuleType(`another`)),
        )
    })
    describe(`Should detect uncalled Background`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Background:`,
            `       Given vitest-cucumber is running`,
        ]).parseContent()

        afterAll(() => {
            expect(feature.background?.isCalled).toBe(false)
        })

        expect(() => {
            describeFeature(feature, () => {})
        }).toThrowError(
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            new BackgroundNotCalledError(feature.background!),
        )
    })
    describe(`should detect uncalled Scenario`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario: Simple scenario`,
            `       Given vitest-cucumber is running`,
            `       Then  check if I am called`,
        ]).parseContent()

        afterAll(() => {
            expect(feature.scenarii[0].isCalled).toBe(false)
        })

        expect(() => {
            describeFeature(feature, () => {})
        }).toThrowError(new ScenarioNotCalledError(feature.scenarii[0]))
    })
    describe(`should detect uncalled ScenarioOutline`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario Outline: Simple scenario`,
            `       Given vitest-cucumber is <state>`,
            `       Then  check if I am called`,
            `       Examples:`,
            `           | state    |`,
            `           | running  |`,
            `           | finished |`,
            ``,
        ]).parseContent()

        afterAll(() => {
            expect(feature.scenarii[0].isCalled).toBe(false)
        })

        expect(() => {
            describeFeature(feature, () => {})
        }).toThrowError(new ScenarioNotCalledError(feature.scenarii[0]))
    })
    describe(`should detect if background exists`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario: Simple scenario`,
            `       Given vitest-cucumber is running`,
            `       Then  check if I am called`,
        ]).parseContent()

        expect(() => {
            describeFeature(feature, (f) => {
                f.Background(() => {})
            })
        }).toThrowError(new BackgroundNotExistsError(feature))
    })
    describe(`should detetc if Scenario is Outline`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario Outline: Simple scenario`,
            `       Given vitest-cucumber is <state>`,
            `       Then  check if I am called`,
            `       Examples:`,
            `           | state    |`,
            `           | running  |`,
            `           | finished |`,
            ``,
        ]).parseContent()

        expect(() => {
            describeFeature(feature, (f) => {
                f.Scenario(`Simple scenario`, () => {})
            })
        }).toThrowError(new IsScenarioOutlineError(feature.scenarii[0]))
    })
    describe(`should detetc if Scenario isn't Outline`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario: Simple scenario`,
            `       Given vitest-cucumber is <state>`,
            `       Then  check if I am called`,
            ``,
        ]).parseContent()

        expect(() => {
            describeFeature(feature, (f) => {
                f.ScenarioOutline(`Simple scenario`, () => {})
            })
        }).toThrowError(new NotScenarioOutlineError(feature.scenarii[0]))
    })
    describe(`should detetc if Scenario exists`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario: Simple scenario`,
            `       Given vitest-cucumber is <state>`,
            `       Then  check if I am called`,
            ``,
        ]).parseContent()

        expect(() => {
            describeFeature(feature, (f) => {
                f.Scenario(`unknow scenario`, () => {})
            })
        }).toThrowError(
            new FeatureUknowScenarioError(
                feature,
                new ScenarioType(`unknow scenario`),
            ),
        )
    })
})

describe(`Rule`, () => {
    describe(`Should detect uncalled Background`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Rule: simple rule`,
            `      Background:`,
            `          Given vitest-cucumber is running`,
        ]).parseContent()

        afterAll(() => {
            expect(feature.rules[0].background?.isCalled).toBe(false)
        })

        describeFeature(feature, (f) => {
            expect(() => {
                f.Rule(`simple rule`, () => {})
            }).toThrowError(
                // biome-ignore lint/style/noNonNullAssertion: <explanation>
                new BackgroundNotCalledError(feature.rules[0].background!),
            )
        })
    })
    describe(`Should detect uncalled Scenario`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Rule: simple rule`,
            `      Scenario: test`,
            `          Given vitest-cucumber is running`,
        ]).parseContent()

        afterAll(() => {
            expect(feature.rules[0].scenarii[0].isCalled).toBe(false)
        })

        describeFeature(feature, (f) => {
            expect(() => {
                f.Rule(`simple rule`, () => {})
            }).toThrowError(
                new ScenarioNotCalledError(feature.rules[0].scenarii[0]),
            )
        })
    })
    describe(`should detect uncalled ScenarioOutline`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Rule: simple rule`,
            `      Scenario Outline: Simple scenario`,
            `          Given vitest-cucumber is <state>`,
            `          Then  check if I am called`,
            `          Examples:`,
            `              | state    |`,
            `              | running  |`,
            `              | finished |`,
            ``,
        ]).parseContent()

        afterAll(() => {
            expect(feature.rules[0].scenarii[0].isCalled).toBe(false)
        })

        describeFeature(feature, (f) => {
            expect(() => {
                f.Rule(`simple rule`, () => {})
            }).toThrowError(
                new ScenarioNotCalledError(feature.rules[0].scenarii[0]),
            )
        })
    })
    describe(`should detect if background exists`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Rule: simple rule`,
            `      Scenario: Simple scenario`,
            `          Given vitest-cucumber is running`,
            `          Then  check if I am called`,
        ]).parseContent()

        expect(() => {
            describeFeature(feature, (f) => {
                f.Rule(`simple rule`, (r) => {
                    r.RuleBackground(() => {})
                })
            })
        }).toThrowError(new BackgroundNotExistsError(feature.rules[0]))
    })
    describe(`should detetc if Scenario is Outline`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Rule: simple rule`,
            `      Scenario Outline: Simple scenario`,
            `          Given vitest-cucumber is <state>`,
            `          Then  check if I am called`,
            `          Examples:`,
            `              | state    |`,
            `              | running  |`,
            `              | finished |`,
            ``,
        ]).parseContent()

        expect(() => {
            describeFeature(feature, (f) => {
                f.Rule(`simple rule`, (r) => {
                    r.RuleScenario(`Simple scenario`, () => {})
                })
            })
        }).toThrowError(
            new IsScenarioOutlineError(feature.rules[0].scenarii[0]),
        )
    })
    describe(`should detetc if Scenario isn't Outline`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Rule: simple rule`,
            `      Scenario: Simple scenario`,
            `          Given vitest-cucumber is <state>`,
            `          Then  check if I am called`,
            ``,
        ]).parseContent()

        expect(() => {
            describeFeature(feature, (f) => {
                f.Rule(`simple rule`, (r) => {
                    r.RuleScenarioOutline(`Simple scenario`, () => {})
                })
            })
        }).toThrowError(
            new NotScenarioOutlineError(feature.rules[0].scenarii[0]),
        )
    })
    describe(`should detetc if Scenario exists`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Rule: simple rule`,
            `      Scenario: Simple scenario`,
            `          Given vitest-cucumber is <state>`,
            `          Then  check if I am called`,
            ``,
        ]).parseContent()

        expect(() => {
            describeFeature(feature, (f) => {
                f.Rule(`simple rule`, (r) => {
                    r.RuleScenario(`unknow scenario`, () => {})
                })
            })
        }).toThrowError(
            new FeatureUknowScenarioError(
                feature.rules[0],
                new ScenarioType(`unknow scenario`),
            ),
        )
    })
})

describe(`Scenario`, () => {
    describe(`should detect uncalled Scenario step`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario: Simple scenario`,
            `       Given vitest-cucumber is running`,
            `       Then  check if I am called`,
        ]).parseContent()

        const testShouldNotStart = vi.fn()

        afterAll(() => {
            expect(feature.scenarii[0].isCalled).toBe(true)
            expect(feature.scenarii[0].steps[0].isCalled).toBe(true)
            expect(feature.scenarii[0].steps[1].isCalled).toBe(false)
            expect(testShouldNotStart).not.toHaveBeenCalled()
        })

        describeFeature(feature, (f) => {
            expect(() => {
                f.Scenario(`Simple scenario`, (s) => {
                    s.Given(`vitest-cucumber is running`, () => {
                        testShouldNotStart()
                    })
                })
            }).toThrowError(
                new StepAbleStepsNotCalledError(
                    feature.scenarii[0],
                    feature.scenarii[0].steps[1],
                ),
            )
        })
    })
    describe(`should detect if step exists`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario: Simple scenario`,
            `       Given vitest-cucumber is running`,
            `       Then  check if I am called`,
        ]).parseContent()

        describeFeature(feature, (f) => {
            expect(() => {
                f.Scenario(`Simple scenario`, (s) => {
                    s.Given(`kaamelott`, () => {})
                })
            }).toThrowError(
                new StepAbleUnknowStepError(
                    feature.scenarii[0],
                    new Step(StepTypes.GIVEN, `kaamelott`),
                ),
            )
        })
    })
})

describe(`Background`, () => {
    describe(`should detect uncalled Background step`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Background:`,
            `       Given vitest-cucumber is running`,
        ]).parseContent()

        afterAll(() => {
            expect(feature.background?.steps[0].isCalled).toBe(false)
        })

        describeFeature(feature, (f) => {
            expect(() => {
                f.Background(() => {})
            }).toThrowError(
                new StepAbleStepsNotCalledError(
                    // biome-ignore lint/style/noNonNullAssertion: <explanation>
                    feature.background!,
                    // biome-ignore lint/style/noNonNullAssertion: <explanation>
                    feature.background!.steps[0],
                ),
            )
        })
    })
    describe(`should detect if step exists`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Background:`,
            `       Given vitest-cucumber is running`,
        ]).parseContent()

        describeFeature(feature, (f) => {
            expect(() => {
                f.Background((s) => {
                    s.Given(`kaamelott`, () => {})
                })
            }).toThrowError(
                new StepAbleUnknowStepError(
                    // biome-ignore lint/style/noNonNullAssertion: <explanation>
                    feature.background!,
                    new Step(StepTypes.GIVEN, `kaamelott`),
                ),
            )
        })
    })
})

describe(`ScenarioOutline`, () => {
    describe(`should detect uncalled ScenarioOutline step`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario Outline: Simple scenario`,
            `       Given vitest-cucumber is <state>`,
            `       Then  check if I am called`,
            `       Examples:`,
            `           | state    |`,
            `           | running  |`,
            `           | finished |`,
            ``,
        ]).parseContent()

        afterAll(() => {
            expect(feature.scenarii[0].isCalled).toBe(true)
            expect(feature.scenarii[0].steps[0].isCalled).toBe(false)
        })

        describeFeature(feature, (f) => {
            expect(() => {
                f.ScenarioOutline(`Simple scenario`, () => {})
            }).toThrowError(
                new StepAbleStepsNotCalledError(
                    feature.scenarii[0],
                    feature.scenarii[0].steps[0],
                ),
            )
        })
    })
    describe(`should detect if step exists`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Scenario Outline: Simple scenario`,
            `       Given vitest-cucumber is <state>`,
            `       Then  check if I am called`,
            `       Examples:`,
            `           | state    |`,
            `           | running  |`,
            `           | finished |`,
            ``,
        ]).parseContent()

        describeFeature(feature, (f) => {
            expect(() => {
                f.ScenarioOutline(`Simple scenario`, (s) => {
                    s.Given(`kaamelott`, () => {})
                })
            }).toThrowError(
                new StepAbleUnknowStepError(
                    feature.scenarii[0],
                    new Step(StepTypes.GIVEN, `kaamelott`),
                ),
            )
        })
    })
})

describe('use language for feature', () => {
    const content = `
        Fonctionnalité: vitest-cucumber en français
            Contexte:
                Sachant que Je parle "français"
            Scénario: premier jet
                Etant donné que Je code en javascript
                Quand Je lance les tests
                Alors Il capte que je parle français
            Règle: utiliser des plans de scénario
                Plan du Scénario: plusieurs versions
                    Sachant que J'utilise Vue <version>
                    Et que J'utilise "nanostores"
                    Lorsque Je lance les tests
                    Donc Je n'ai pas d'erreur
                    Mais Ça me rassure

                    Exemples:
                        | version |
                        | 2       |
                        | 3       |

    `
    const feature = FeatureContentReader.fromString(
        content.split('\n'),
        'fr',
    ).parseContent()

    describeFeature(feature, (f) => {
        f.Background((b) => {
            b.Given('Je parle {string}', (ctx, lang: string) => {
                expect(lang).toBe('français')
            })
        })
        f.Scenario('premier jet', (s) => {
            s.Given('Je code en javascript', () => {})
            s.When('Je lance les tests', () => {})
            s.Then('Il capte que je parle français', () => {})
        })
        f.Rule('utiliser des plans de scénario', (r) => {
            r.RuleScenarioOutline('plusieurs versions', (s, variables) => {
                s.Given("J'utilise Vue <version>", () => {
                    expect(['2', '3']).toContain(variables.version)
                })
                s.And(`J'utilise {string}`, (ctx, tool: string) => {
                    expect(tool).toEqual('nanostores')
                })
                s.When('Je lance les tests', () => {})
                s.Then("Je n'ai pas d'erreur", () => {})
                s.But('Ça me rassure', () => {})
            })
        })
    })
})

describe('Use onStepError', () => {
    beforeEach(() => {
        setVitestCucumberConfiguration({})
    })

    describe('Scenario', () => {
        const feature = FeatureContentReader.fromString([
            `Feature: onStepError options`,
            `   Scenario: Simple scenario`,
            `       Given I throw an error`,
            `       Then  my onStepError is called`,
        ]).parseContent()

        const onStepError = vi.fn()
        setVitestCucumberConfiguration({ onStepError })

        describeFeature(feature, (f) => {
            f.Scenario('Simple scenario', (s) => {
                s.Given('I throw an error', () => {
                    throw new Error('test')
                })
                s.Then('my onStepError is called', () => {
                    expect(onStepError).toHaveBeenCalledWith({
                        error: new Error('test'),
                        step: feature.scenarii[0]?.steps[0],
                        ctx: expect.any(Function),
                    })
                })
            })
        })
    })
})
