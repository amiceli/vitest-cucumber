import type { Step } from "../../parser/step"
import type { MaybePromise } from "../types"

export type ScenarioSteps = {
    key: string
    fn : (...params : unknown[]) => MaybePromise
    step: Step
    params : unknown[]
}