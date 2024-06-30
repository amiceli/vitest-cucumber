// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
    packageManager: "npm",
    reporters: ["html", "progress"],
    testRunner: "vitest",
    "vitest": {
        "configFile": "vitest.config.ts",
    },
    checkers: ["typescript",],
    tsconfigFile: "tsconfig.vitest.json",
    tempDirName: "stryker-tmp",
}

export default config
