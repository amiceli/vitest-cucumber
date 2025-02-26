export type DescribesToRun = Array<{
    skipped: boolean
    only: boolean
    describeTitle: string
    describeHandler: () => void
}>

type DescribesToRunOrSkip = {
    describeToRun: DescribesToRun
    describeToSkip: DescribesToRun
    onlyDescribeToRun: DescribesToRun
}

export function defineRuleScenarioToRun(options: {
    describes: DescribesToRun
    ruleBackground: DescribesToRun[0] | null
    featureBackground: DescribesToRun[0] | null
}): DescribesToRunOrSkip {
    const describeToRun = options.describes.filter((d) => !d.skipped && !d.only)
    const describeToSkip = options.describes.filter((d) => d.skipped && !d.only)
    const onlyDescribeToRun = options.describes.filter(
        (d) => !d.skipped && d.only,
    )

    const finalDescribesToRun: DescribesToRun = []

    for (const toRun of describeToRun) {
        if (options.featureBackground) {
            if (options.featureBackground.skipped) {
                describeToSkip.push(options.featureBackground)
            } else {
                finalDescribesToRun.push(options.featureBackground)
            }
        }
        if (options.ruleBackground) {
            if (options.ruleBackground.skipped) {
                describeToSkip.push(options.ruleBackground)
            } else {
                finalDescribesToRun.push(options.ruleBackground)
            }
        }
        finalDescribesToRun.push(toRun)
    }

    return {
        describeToRun: finalDescribesToRun,
        describeToSkip,
        onlyDescribeToRun,
    }
}

export function defineScenarioToRun(options: {
    describes: DescribesToRun
    describeRules: DescribesToRun
    featureBackground: DescribesToRun[0] | null
}): DescribesToRunOrSkip {
    const describeToRun = options.describes.filter((d) => !d.skipped && !d.only)
    const describeToSkip = options.describes.filter((d) => d.skipped && !d.only)
    const onlyDescribeToRun = options.describes.filter(
        (d) => !d.skipped && d.only,
    )

    const finalDescribesToRun: DescribesToRun = []

    for (const toRun of describeToRun) {
        if (options.featureBackground) {
            if (options.featureBackground.skipped) {
                describeToSkip.push(options.featureBackground)
            } else {
                finalDescribesToRun.push(options.featureBackground)
            }
        }
        finalDescribesToRun.push(toRun)
    }

    describeToSkip.push(
        ...options.describeRules.filter((s) => s.skipped && !s.only),
    )
    finalDescribesToRun.push(
        ...options.describeRules.filter((s) => !s.skipped && !s.only),
    )
    onlyDescribeToRun.push(
        ...options.describeRules.filter((s) => !s.skipped && s.only),
    )

    return {
        describeToRun: finalDescribesToRun,
        describeToSkip,
        onlyDescribeToRun,
    }
}
