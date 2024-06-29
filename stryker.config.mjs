// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
    packageManager: "npm",
    reporters: ["html", "progress"],
    testRunner: "vitest",
    ignoreStatic : true,
    "vitest": {
        "configFile": "vitest.config.ts",
    },
    coverageAnalysis: "perTest",
    buildCommand: "npm run build",
    checkers: ["typescript",],
    tsconfigFile: "tsconfig.json",
    tempDirName: "stryker-tmp",
}

export default config
