import { NotAllowedBackgroundStepTypeError } from '../errors/errors'
import { StepAble } from './Stepable'
import { Step, StepTypes } from './step'

const BackgroundAllowedSteps = [
    StepTypes.GIVEN, StepTypes.AND,
]

export class Background extends StepAble {

    public isCalled : boolean = false

    public addStep (step : Step) {
        if (BackgroundAllowedSteps.includes(step.type)) {
            this.steps.push(step)
        } else {
            throw new NotAllowedBackgroundStepTypeError(step.type)
        }
    }

}
