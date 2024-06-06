import { NotAllowedBackgroundStepTypeError } from '../errors/errors'
import { StepAble } from './Stepable'
import { Step, StepTypes } from './step'

const BackgroundAllowedSteps = [
    StepTypes.GIVEN, StepTypes.AND,
]

export class Background extends StepAble {
    
    public getTitle (): string {
        return `Background:`
    }

    public addStep (step : Step) {
        if (BackgroundAllowedSteps.includes(step.type)) {
            super.addStep(step)
        } else {
            throw new NotAllowedBackgroundStepTypeError(step.type)
        }
    }

}
