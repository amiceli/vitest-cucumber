#!/usr/bin/env node

import { loadFeature } from '../src/vitest/load-feature'
import { writeSpecFile } from './generateFile'

const [featureFilePath, specFilePath] = process.argv.slice(2)

loadFeature(featureFilePath).then((feature) => {
    writeSpecFile({
        feature,
        featureFilePath,
        specFilePath,
    })
})
