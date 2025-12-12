import {
    ItemAlreadyExistsError,
    StepAbleStepExpressionError,
    StepAbleStepsNotCalledError,
    StepAbleUnknowStepError,
} from '../../errors/errors'
import { ExpressionStep } from '../expression/ExpressionStep'
import { Step, type StepTypes } from './step'
import { Taggable } from './Taggable'

export abstract class StepAble extends Taggable {
    public abstract getTitle(): string

    public isCalled: boolean

    private readonly _steps: Step[]

    protected readonly title: string

    public constructor(title: string) {
        super()

        this.title = title
        this.isCalled = false
        this._steps = []
    }

    public stepFailedExpressionMatch: {
        [key: string]: number
    } = {}

    public findStepByTypeAndDetails(
        type: string,
        details: string,
    ): Step | undefined {
        this.stepFailedExpressionMatch[details] = 0

        return this._steps.find((step: Step) => {
            try {
                const sameType = step.type === type
                const sameDetails = step.details === details

                if (ExpressionStep.stepContainsRegex(details)) {
                    const params = ExpressionStep.matchStep(step, details)

                    return sameType && (sameDetails || params.length >= 0)
                }

                return sameType && sameDetails
            } catch (_e) {
                this.stepFailedExpressionMatch[details] += 1
                return false
            }
        })
    }

    public hasUnCalledSteps(): boolean {
        return this.getNoCalledStep() !== undefined
    }

    public getNoCalledStep(): Step | undefined {
        return this._steps.find((s) => s.isCalled === false)
    }

    public addStep(newStep: Step) {
        const duplicatedStep = this._steps.find((step) => {
            return step.getTitle() === newStep.getTitle()
        })

        if (duplicatedStep) {
            throw new ItemAlreadyExistsError(this, newStep)
        }
        this._steps.push(newStep)
    }

    public checkIfStepWasCalled() {
        const step = this.getNoCalledStep()

        if (step) {
            throw new StepAbleStepsNotCalledError(this, step)
        }
    }

    public checkIfStepExists(stepType: string, stepDetails: string) {
        const foundStep = this.findStepByTypeAndDetails(stepType, stepDetails)

        if (!foundStep) {
            if (
                this.stepFailedExpressionMatch[stepDetails] ===
                this._steps.length
            ) {
                throw new StepAbleStepExpressionError(
                    this,
                    new Step(stepType as StepTypes, stepDetails),
                )
            }
            throw new StepAbleUnknowStepError(
                this,
                new Step(stepType as StepTypes, stepDetails),
            )
        }

        return foundStep
    }

    public get lastStep(): Step {
        return this._steps[this._steps.length - 1]
    }

    public get steps(): Readonly<Step[]> {
        return this._steps
    }
}
