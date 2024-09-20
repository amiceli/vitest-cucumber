import { describe, it } from 'node:test'
import { expect } from 'vitest'
import { StepTypes } from '../../step'
import { SpokenParserFactory } from '../SpokenParser'

describe('SpokenParser', () => {
    it('should check if line is a step', () => {
        expect(
            SpokenParserFactory.fromLang('fr').isStep('Alors je lance vitest'),
        ).toBe(true)
        expect(
            SpokenParserFactory.fromLang('fr').isStep('Test ça marche pas'),
        ).toBe(false)
        expect(
            SpokenParserFactory.fromLang('it').isStep('Dato sono contento'),
        ).toBe(true)
    })

    it('should match Step for a language', () => {
        const frenchSpoken = SpokenParserFactory.fromLang('fr')

        expect(frenchSpoken.getStepType('Alors je lance vitest')).toBe(
            StepTypes.THEN,
        )
        expect(frenchSpoken.getStepType('Et je lance esbuild')).toBe(
            StepTypes.AND,
        )
        expect(() => {
            frenchSpoken.getStepType('Pourtant ça marche')
        }).toThrowError(new Error('Type not found'))

        const italianSpoken = SpokenParserFactory.fromLang('it')

        expect(italianSpoken.getStepType('Dato sono contento')).toBe(
            StepTypes.GIVEN,
        )
        expect(italianSpoken.getStepType('Ma sono stanco')).toBe(StepTypes.BUT)
        expect(() => {
            italianSpoken.getStepType('Buono sera')
        }).toThrowError(new Error('Type not found'))
    })

    it('should provide en as default language', () => {
        const defaultSpoken = SpokenParserFactory.fromLang('another')

        expect(defaultSpoken.getStepType('Then I use en')).toBe(StepTypes.THEN)
        expect(() => {
            defaultSpoken.getStepType('Mais I try another lang')
        }).toThrowError(new Error('Type not found'))
    })

    it('should check if line is a background', () => {
        expect(
            SpokenParserFactory.fromLang('fr').isBackground(
                'Contexte: je fais du JS',
            ),
        ).toBe(true)
        expect(
            SpokenParserFactory.fromLang('fr').isBackground(
                'Background: je fais du JS',
            ),
        ).toBe(false)
        expect(
            SpokenParserFactory.fromLang('sr-Latn').isBackground(
                'Osnova: sr-latin',
            ),
        ).toBe(true)
    })

    it('should check if line is a scenario', () => {
        expect(
            SpokenParserFactory.fromLang('fr').isScenario(
                'Scénario: je fais du JS',
            ),
        ).toBe(true)
        expect(
            SpokenParserFactory.fromLang('fr').isScenario(
                'Background: je fais du JS',
            ),
        ).toBe(false)
        expect(
            SpokenParserFactory.fromLang('sr-Latn').isScenario(
                'Primer: sr-latin',
            ),
        ).toBe(true)
    })

    it('should check if line is a scenario outline', () => {
        expect(
            SpokenParserFactory.fromLang('fr').isScenarioOutline(
                'Plan du scénario: je fais du JS',
            ),
        ).toBe(true)
        expect(
            SpokenParserFactory.fromLang('fr').isScenarioOutline(
                'Background: je fais du JS',
            ),
        ).toBe(false)
        expect(
            SpokenParserFactory.fromLang('it').isScenarioOutline(
                'Schema dello scenario: ciao fratello',
            ),
        ).toBe(true)
    })

    it('should check if line is an Examples', () => {
        expect(SpokenParserFactory.fromLang('fr').isExamples('Exemples:')).toBe(
            true,
        )
        expect(
            SpokenParserFactory.fromLang('fr').isExamples('Test ça marche pas'),
        ).toBe(false)
        expect(SpokenParserFactory.fromLang('it').isExamples('Esempi:')).toBe(
            true,
        )
    })

    it('should check if line is a Rule', () => {
        expect(SpokenParserFactory.fromLang('fr').isRule('Règles: test')).toBe(
            true,
        )
        expect(
            SpokenParserFactory.fromLang('fr').isRule('Test ça marche pas'),
        ).toBe(false)
        expect(SpokenParserFactory.fromLang('it').isRule('Regola:')).toBe(true)
    })
})
