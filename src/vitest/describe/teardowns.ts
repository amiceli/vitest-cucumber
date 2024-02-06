import { Feature } from "../../parser/feature"
import { FeatureStateDetector } from "../state-detectors/FeatureStateDetector"

export function detectUnCalledScenarioAndRules (feature : Feature) {
    FeatureStateDetector
        .forFeature(feature)
        .checkNotCalledScenario()

    FeatureStateDetector
        .forFeature(feature)
        .checkNotCalledRule()
}