import type { Step } from '../../parser/models/step'
import type {
    CallbackWithParamsAndContext,
    CallbackWithSingleContext,
} from '../types'

export type CompiledPattern = {
    regex: RegExp
    originalPattern: string
}

export type ScenarioSteps = {
    key: string
    fn: CallbackWithSingleContext | CallbackWithParamsAndContext
    step: Step
    params: unknown[]
    compiledPattern?: CompiledPattern
}

export type StepMap = [
    string,
    ScenarioSteps,
]
