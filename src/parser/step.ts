
export enum stepNames {
    THEN = 'Then',
    AND = 'And',
    WHEN = 'When',
    GIVEN = 'Given',
}

type StepDetails = {
    name : stepNames
    title : string
}

export class Step {

    public readonly name : stepNames
    
    public readonly title : string

    public isCalled : boolean = false

    public constructor (details : StepDetails) {
        this.name = details.name
        this.title = details.title
    }

}