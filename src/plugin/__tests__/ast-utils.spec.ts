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

        expect(sourceFile).not.toBeUndefined()
        expect(() => {
            const anotherSourceFile = getSourceFileFromPath('another.ts')
        }).toThrowError()
    })
    it('should be able to find call expression', () => {
        const sourceFile = getSourceFileFromPath(testFilePath)

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
    })
    it('should be able to find call expression with args', () => {
        const sourceFile = getSourceFileFromPath(testFilePath)

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
    })
})
