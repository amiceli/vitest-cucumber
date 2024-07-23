import { type TaskContext } from "vitest"
import { type Step } from "../../parser/step"
import { type MaybePromise } from "../types"

export type ScenarioSteps = {
    key : string
    fn : (ctx : TaskContext) => MaybePromise
    step : Step
}

export type StepMap = [string, ScenarioSteps]
