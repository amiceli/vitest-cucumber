import { Step, StepTypes } from "../../parser/step"
import { describeFeature } from '../describe-feature'
import {
    BackgroundNotCalledError,
    BackgroundNotExistsError,
    FeatureUknowRuleError,
    FeatureUknowScenarioError,
    IsScenarioOutlineError,
    NotScenarioOutlineError,
    RuleNotCalledError,
    ScenarioNotCalledError, StepAbleStepsNotCalledError,
    StepAbleUnknowStepError,
} from "../../errors/errors"
import {
    afterAll,
    describe,
    expect,
    vi,
} from "vitest"
import { FeatureContentReader } from "../../__mocks__/FeatureContentReader.spec"
import { Rule as RuleType } from "../../parser/Rule"
import { Scenario as ScenarioType } from "../../parser/scenario"

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
            expect(
                feature.rules[0].isCalled,
            ).toBe(false)
        })
    
        expect(() => {
            describeFeature(feature, () => { })
        }).toThrowError(
            new RuleNotCalledError(feature.rules[0]),
        )
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
            new FeatureUknowRuleError(
                feature,
                new RuleType(`another`),
            ),
        )
        
    })
    describe(`Should detect uncalled Background`, () => {
        const feature = FeatureContentReader.fromString([
            `Feature: one scenario with missing steps`,
            `   Background:`,
            `       Given vitest-cucumber is running`,
        ]).parseContent()
    
        afterAll(() => {
            expect(
                feature.background?.isCalled,
            ).toBe(false)
        })
    
        expect(() => {
            describeFeature(feature, () => { })
        }).toThrowError(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
            expect(
                feature.scenarii[0].isCalled,
            ).toBe(false)
        })
    
        expect(() => {
            describeFeature(feature, () => { })
        }).toThrowError(
            new ScenarioNotCalledError(feature.scenarii[0]),
        )
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
            expect(
                feature.scenarii[0].isCalled,
            ).toBe(false)
        })
    
        expect(() => {
            describeFeature(feature, () => { })
        }).toThrowError(
            new ScenarioNotCalledError(feature.scenarii[0]),
        )
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
        }).toThrowError(
            new BackgroundNotExistsError(feature),
        )
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
        }).toThrowError(
            new IsScenarioOutlineError(feature.scenarii[0]),
        )
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
        }).toThrowError(
            new NotScenarioOutlineError(feature.scenarii[0]),
        )
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
            expect(
                feature.rules[0].background?.isCalled,
            ).toBe(false)
        })

        describeFeature(feature, (f) => { 
            expect(() => {
                f.Rule(`simple rule`, () => {})
            }).toThrowError(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
            expect(
                feature.rules[0].scenarii[0].isCalled,
            ).toBe(false)
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
            expect(
                feature.rules[0].scenarii[0].isCalled,
            ).toBe(false)
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
        }).toThrowError(
            new BackgroundNotExistsError(feature.rules[0]),
        )
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
            expect(
                feature.scenarii[0].isCalled,
            ).toBe(true)
            expect(
                feature.scenarii[0].steps[0].isCalled,
            ).toBe(true)
            expect(
                feature.scenarii[0].steps[1].isCalled,
            ).toBe(false)
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
            expect(
                feature.background?.steps[0].isCalled,
            ).toBe(false)
        })
    
        describeFeature(feature, (f) => {
            expect(() => {
                f.Background(() => {})
            }).toThrowError(
                new StepAbleStepsNotCalledError(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    feature.background!,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
            expect(
                feature.scenarii[0].isCalled,
            ).toBe(true)
            expect(
                feature.scenarii[0].steps[0].isCalled,
            ).toBe(false)
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
