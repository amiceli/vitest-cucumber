import { Scenario } from './scenario'

export class Feature {

    public readonly name : string

    public readonly scenarii : Scenario[] = []

    public constructor (name : string) {
        this.name = name
    }

}
