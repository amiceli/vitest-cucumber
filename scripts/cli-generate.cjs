const { loadFeature } = require('../dist-common/vitest/load-feature')
const fs = require('fs/promises')

const [filePath, outPath] = process.argv.slice(2)

function generateScenarii(scenarii, forRule = false) {
    const fileContent = [""]

    scenarii.forEach((scenario) => {
        const scenarioStepTypes = [
            'Given', 'When', 'Then', 'And', 'But'
        ].filter((step) => scenario.steps.map((scenarioSteps) => scenarioSteps.type).includes(step))
        let scenarioType = 'Scenario'

        if (scenario.examples) {
            scenarioType = forRule ? 'RuleScenarioOutline' : 'ScenarioOutline'
        } else {
            scenarioType = forRule ? 'RuleScenario' : 'Scenario'
        }

        if (scenario.examples) {
            fileContent.push(`  ${scenarioType}(\`${scenario.description}\`, ({ ${scenarioStepTypes.join(', ')} }, variables) => {`)
        } else {
            fileContent.push(`  ${scenarioType}(\`${scenario.description}\`, ({ ${scenarioStepTypes.join(', ')} }) => {`)
        }

        scenario.steps.forEach((step) => {
            fileContent.push(`      ${step.type}(\`${step.details}\`, () => { })`)
        })
        fileContent.push(`  })`)
    })

    return fileContent
}

function generateRules(rules) {
    const fileContent = []

    rules.forEach((r) => {
        const rulesHook = []

        if (r.scenarii.some((s) => s.examples)) {
            rulesHook.push('RuleScenarioOutline')
        }
        if (r.scenarii.some((s) => s.examples === undefined)) {
            rulesHook.push('RuleScenario')
        }

        fileContent.push("")
        fileContent.push(`  Rule(\`${r.name}\`, ({ ${rulesHook.join(', ')} }) => {`)
        fileContent.push(
            ...generateScenarii(r.scenarii, true)
        )
        fileContent.push("")
        fileContent.push(`  })`)
    })

    return fileContent
}

loadFeature(filePath).then(async (feature) => {
    const fileContent = []
    const describeHook = [
        'BeforeAllScenarios',
        'AfterAllScenarios',
        'BeforeEachScenario',
        'AfterEachScenario',
    ]
    const describeFeatureArgs = [
        ...describeHook,
    ]

    if (feature.scenarii.some((s) => s.examples)) {
        describeFeatureArgs.push('ScenarioOutline')
    }
    if (feature.scenarii.some((s) => s.examples === undefined)) {
        describeFeatureArgs.push('Scenario')
    }
    if(feature.rules.length > 0) {
        describeFeatureArgs.push('Rule')
    }

    fileContent.push('import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber"')
    fileContent.push("")
    fileContent.push(`const featureCampagneFilter = await loadFeature('${filePath}')`)
    fileContent.push("")
    fileContent.push(`describeFeature(featureCampagneFilter, ({ ${describeFeatureArgs.join(', ')} }) => {`)

    describeHook.forEach((s) => {
        fileContent.push(`  ${s}(() => {})`)
    })

    fileContent.push(
        ...generateScenarii(feature.scenarii),
        ...generateRules(feature.rules)
    )

    fileContent.push("")
    fileContent.push(`})`)

    await fs.writeFile(outPath, fileContent.join("\n"))
})