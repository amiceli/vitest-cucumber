import { type TaskContext } from "vitest"
import { type Step } from "../../parser/step"
import { type MaybePromise } from "../types"

export type ScenarioSteps = {
    key : string
    fn : (...params: [...unknown[], TaskContext]) => MaybePromise
    step : Step
    params : unknown[]
}

export type StepMap = [string, ScenarioSteps]
