import { NotAllowedBackgroundStepTypeError } from '../../errors/errors'
import { StepAble } from './Stepable'
import { type Step, StepTypes } from './step'

const BackgroundAllowedSteps = [StepTypes.GIVEN, StepTypes.AND]

export class Background extends StepAble {
    public constructor(title: string = 'Background') {
        super(title)
    }

    public getTitle(): string {
        return `${this.title}:`
    }

    public addStep(step: Step) {
        if (BackgroundAllowedSteps.includes(step.type)) {
            super.addStep(step)
        } else {
            throw new NotAllowedBackgroundStepTypeError(step.type)
        }
    }
}
