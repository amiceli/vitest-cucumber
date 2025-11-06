import { DefineFeature } from '../parser/models'
import { describeFeature } from './describe-feature'
import type { DescribeFeatureCallback } from './types'

export function defineFeature(
    featureName: string,
    describeFeatureCallback: DescribeFeatureCallback,
) {
    const feature = new DefineFeature(featureName, 'Feature', true)

    return describeFeature(feature, describeFeatureCallback, {})
}
