import fs from 'node:fs'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
    getCallExpression,
    getCallExpressionWithArg,
    getSourceFileFromPath,
    isString,
} from '../ast/ast-utils'

describe('ast-utils', () => {
    const testFilePath = 'src/plugin/ast/example.ts'

    beforeAll(() => {
        fs.writeFileSync(
            testFilePath,
            `
            function Scenario (name : string) {}
            function Given (name : string) {}

            Scenario('awesome', () => {
                Given('step', () => {})
            })
        `,
        )
    })
    afterAll(() => {
        fs.rmSync(testFilePath)
    })
    it('should be able to get sourceFile from path', () => {
        const sourceFile = getSourceFileFromPath(testFilePath)
        const anotherSourceFile = getSourceFileFromPath('another.ts')

        expect(sourceFile).not.toBeUndefined()
        expect(anotherSourceFile).toBeUndefined()
    })
    it('should be able to find call expression', () => {
        const sourceFile = getSourceFileFromPath(testFilePath)

        if (sourceFile) {
            expect(
                getCallExpression({
                    sourceFile,
                    text: 'Scenario',
                }),
            ).not.toBeUndefined()
            expect(
                getCallExpression({
                    sourceFile,
                    text: 'Rule',
                }),
            ).toBeUndefined()
        } else {
            expect.fail('sourceFile should not be undefined')
        }
    })
    it('should be able to find call expression with args', () => {
        const sourceFile = getSourceFileFromPath(testFilePath)

        if (sourceFile) {
            expect(
                getCallExpressionWithArg({
                    sourceFile,
                    text: 'Scenario',
                    arg: 'awesome',
                }),
            ).not.toBeUndefined()
            expect(
                getCallExpressionWithArg({
                    sourceFile,
                    text: 'Scenario',
                    arg: 'another',
                }),
            ).toBeUndefined()
        } else {
            expect.fail('sourceFile should not be undefined')
        }
    })
    it('should be able to detect all string types', () => {
        fs.writeFileSync(
            testFilePath,
            `
            Scenario('awesome')
            Background("another")
            Rule(\`again\`)
            Step(true)
        `,
        )
        const sourceFile = getSourceFileFromPath(testFilePath)
        if (sourceFile) {
            for (const text of ['Background', 'Scenario', 'Rule']) {
                const call = getCallExpression({
                    sourceFile,
                    text,
                })
                const arg = call?.getArguments().at(0)?.getKind()
                if (arg) {
                    expect(isString(arg)).toBe(true)
                } else {
                    expect.fail(`arg should not be undefined for ${text}`)
                }
            }
            const call = getCallExpression({
                sourceFile,
                text: 'Step',
            })
            const arg = call?.getArguments().at(0)?.getKind()
            if (arg) {
                expect(isString(arg)).toBe(false)
            } else {
                expect.fail(`arg should not be undefined for Step`)
            }
        } else {
            expect.fail('sourceFile should not be undefined')
        }
    })
})