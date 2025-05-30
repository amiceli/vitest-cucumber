#!/usr/bin/env node

import minimist from 'minimist'
import { loadFeature } from '../src/vitest/load-feature'
import { writeSpecFile } from './generateFile'

const { feature, spec, lang } = minimist(process.argv.slice(2))

if (!feature) {
    console.error('--feature option is required')
}

if (!spec) {
    console.error('--spec option is required')
}

loadFeature(feature, { language: lang || 'en' }).then((f) => {
    writeSpecFile({
        feature: f,
        featureFilePath: feature,
        specFilePath: spec,
    })
})
