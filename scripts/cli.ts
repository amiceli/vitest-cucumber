#!/usr/bin/env node

import { loadFeature } from '../src/vitest/load-feature'
import { writeSpecFile } from './generateFile'

const [filePath, outPath] = process.argv.slice(2)

loadFeature(filePath).then((feature) => {
    writeSpecFile(feature, outPath, filePath)
})
