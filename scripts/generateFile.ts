import fs from 'node:fs/promises'
import type { Background } from '../src/parser/models/Background'
import type { Feature } from '../src/parser/models/feature'
import { ScenarioOutline } from '../src/parser/models/scenario'
import type { Step, StepTypes } from '../src/parser/models/step'

export function generateStep(step: Step) {
    if (step.docStrings) {
        return `      ${step.type}(\`${step.details}\`, (_, docString: string) => { })`
    }
    return `      ${step.type}(\`${step.details}\`, () => { })`
}

export function generateScenarii(
    scenarii: Feature['scenarii'],
    forRule = false,
) {
    const fileContent = [
        '',
    ]

    for (const scenario of scenarii) {
        const isOutline = scenario instanceof ScenarioOutline

        const scenarioStepTypes = [
            'Given',
            'When',
            'Then',
            'And',
            'But',
        ].filter((step) =>
            scenario.steps
                .map((scenarioSteps) => scenarioSteps.type)
                .includes(step as StepTypes),
        )
        let scenarioType = 'Scenario'

        if (isOutline) {
            scenarioType = forRule ? 'RuleScenarioOutline' : 'ScenarioOutline'
        } else {
            scenarioType = forRule ? 'RuleScenario' : 'Scenario'
        }

        if (isOutline) {
            fileContent.push(
                `  ${scenarioType}(\`${scenario.description}\`, ({ ${scenarioStepTypes.join(', ')} }, variables) => {`,
            )
        } else {
            fileContent.push(
                `  ${scenarioType}(\`${scenario.description}\`, ({ ${scenarioStepTypes.join(', ')} }) => {`,
            )
        }

        for (const step of scenario.steps) {
            fileContent.push(generateStep(step))
        }

        fileContent.push(`  })`)
    }

    return fileContent
}

export function generateBackground(back: Background, forRule = false) {
    const fileContent = [
        '',
    ]

    const scenarioStepTypes = [
        'Given',
        'When',
        'Then',
        'And',
        'But',
    ].filter((step) =>
        back.steps
            .map((scenarioSteps) => scenarioSteps.type.toString())
            .includes(step),
    )

    const scenarioType = forRule ? 'RuleBackground' : 'Background'
    fileContent.push(
        `  ${scenarioType}(({ ${scenarioStepTypes.join(', ')} }) => {`,
    )

    for (const step of back.steps) {
        fileContent.push(`      ${step.type}(\`${step.details}\`, () => { })`)
    }

    fileContent.push(`  })`)

    return fileContent
}

export function generateRules(rules: Feature['rules']) {
    const fileContent: string[] = []

    for (const r of rules) {
        const rulesHook = []

        if (r.background) {
            rulesHook.push('RuleBackground')
        }
        if (r.scenarii.some((s) => s instanceof ScenarioOutline)) {
            rulesHook.push('RuleScenarioOutline')
        }
        if (r.scenarii.some((s) => !(s instanceof ScenarioOutline))) {
            rulesHook.push('RuleScenario')
        }

        fileContent.push('')
        fileContent.push(
            `  Rule(\`${r.name}\`, ({ ${rulesHook.join(', ')} }) => {`,
        )
        if (r.background) {
            fileContent.push(...generateBackground(r.background, true))
        }
        fileContent.push(...generateScenarii(r.scenarii, true))
        fileContent.push('')
        fileContent.push(`  })`)
    }

    return fileContent
}

type WriteSpecFileOptions = {
    feature: Feature
    specFilePath: string
    featureFilePath: string
}

export async function writeSpecFile({
    feature,
    specFilePath,
    featureFilePath,
}: WriteSpecFileOptions) {
    const featureHasBackground = feature.background !== null
    const featureHasScenario = feature.scenarii.some(
        (s) => !(s instanceof ScenarioOutline),
    )
    const featureHasScenarioOutline = feature.scenarii.some(
        (s) => s instanceof ScenarioOutline,
    )

    const fileContentLines: string[] = []
    const describeHook = [
        'BeforeAllScenarios',
        'AfterAllScenarios',
        'BeforeEachScenario',
        'AfterEachScenario',
    ]
    const describeFeatureArgs = [
        ...describeHook,
    ]
    if (featureHasBackground) {
        describeFeatureArgs.push('Background')
    }
    if (featureHasScenarioOutline) {
        describeFeatureArgs.push('ScenarioOutline')
    }
    if (featureHasScenario) {
        describeFeatureArgs.push('Scenario')
    }
    if (feature.rules.length > 0) {
        describeFeatureArgs.push('Rule')
    }

    fileContentLines.push(
        'import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber"',
    )
    fileContentLines.push('')
    fileContentLines.push(
        `const feature = await loadFeature('${featureFilePath}')`,
    )
    fileContentLines.push('')
    fileContentLines.push(
        `describeFeature(feature, ({ ${describeFeatureArgs.join(', ')} }) => {`,
    )

    for (const s of describeHook) {
        fileContentLines.push(`  ${s}(() => {})`)
    }

    if (featureHasBackground) {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        fileContentLines.push(...generateBackground(feature.background!))
    }

    fileContentLines.push(
        ...generateScenarii(feature.scenarii),
        ...generateRules(feature.rules),
    )

    fileContentLines.push('')
    fileContentLines.push(`})`)

    await fs.writeFile(specFilePath, fileContentLines.join('\n'))
}
