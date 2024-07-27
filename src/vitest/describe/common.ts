import { type Step } from "../../parser/step"
import { CallbackWithParamsAndContext, CallbackWithSingleContext } from "../types"

export type ScenarioSteps = {
    key : string
    fn : CallbackWithSingleContext | CallbackWithParamsAndContext
    step : Step
    params : unknown[]
}

export type StepMap = [string, ScenarioSteps]
