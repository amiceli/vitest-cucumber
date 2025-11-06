import { DefineFeature } from '../parser/models'
import { describeFeature } from './describe-feature'
import type { DefineFeatureCallback } from './types'

export function defineFeature(
    featureName: string,
    describeFeatureCallback: DefineFeatureCallback,
) {
    const feature = new DefineFeature(featureName, 'Feature', true)

    return describeFeature(feature, describeFeatureCallback, {})
}
