import fs from 'node:fs'
import { expect, vi } from 'vitest'
import {
    describeFeature,
    loadFeature,
    VitestCucumberPlugin,
} from '../../../src/module'
import { AstUtils } from '../ast/AstUtils'
import { getSourceFileFromPath } from './spec-utils'

const feature = await loadFeature('src/plugin/__tests__/vitest-plugin.feature')

describeFeature(feature, (f) => {
    f.AfterEachScenario(() => {
        fs.rmSync('src/__tests__/awesome.spec.ts')
        fs.rmSync('src/__tests__/awesome.feature')
    })

    f.Scenario('Create spec file for new feature file', (s) => {
        const fakeServer = {
            ws: {
                send: vi.fn(),
            },
            // biome-ignore lint/suspicious/noExplicitAny: mock vitest server
        } as any

        s.Given("{string} doesn't exists", (_, specPath: string) => {
            fs.rmSync(specPath, {
                force: true,
            })
        })
        s.When(
            'I write {string}',
            async (_, featurePath: string, docString: string) => {
                vi.spyOn(fs, 'watch').mockImplementation(
                    // @ts-expect-error
                    (_: unknown, __: unknown, cb) => {
                        cb('', 'awesome.feature')
                    },
                )

                fs.writeFileSync(featurePath, docString)
                VitestCucumberPlugin({
                    specFilesDir: 'src/__tests__/',
                    featureFilesDir: 'src/__tests__/',
                }).configureServer(fakeServer)
                await new Promise((resolve) => setTimeout(resolve, 300))
            },
        )
        s.Then('vitest-cucumber create {string}', (_, specPath: string) => {
            const sourceFile = getSourceFileFromPath(specPath)

            if (sourceFile) {
                expect(
                    AstUtils.fromSourceFile(sourceFile)
                        .listDescendantCallExpressions()
                        .matchExpressionName('describeFeature')
                        .getOne(),
                ).not.toBe(undefined)
                expect(fs.existsSync(specPath)).toBe(true)
                expect(fakeServer.ws.send).toHaveBeenCalled()
            } else {
                expect.fail('sourceFile should not be undefined')
            }
        })
    })
})
