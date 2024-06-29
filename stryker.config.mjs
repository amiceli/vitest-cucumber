// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
    packageManager: "npm",
    reporters: ["html"],
    testRunner: "vitest",
    coverageAnalysis: "perTest",
    buildCommand: "npm run build",
    "checkers": ["typescript"],
    "tsconfigFile": "tsconfig.json",
}

export default config
