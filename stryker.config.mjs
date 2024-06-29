// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
    packageManager: "npm",
    reporters: ["html", "progress"],
    testRunner: "vitest",
    "vitest": {
        "configFile": "vitest.config.ts",
    },
    coverageAnalysis: "all",
    checkers: ["typescript",],
    tsconfigFile: "tsconfig.vitest.json",
}

export default config
