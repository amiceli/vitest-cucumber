import { Feature } from "./feature";
import { Scenario } from "./scenario";
import { Step, stepNames } from "./step";

export class GherkinParser {

    public features: Feature[] = []

    public currentFeature: number = -1

    public currentScenario : number = -1

    public addLine(line: string) {
        if (line.includes('Feature')) {
            this.currentFeature++

            const name = this.getName(line, 'Feature')
            const feature = new Feature(name)

            this.features.push(feature)
        }

        if (line.includes('Scenario')) {
            this.currentScenario++

            const name = this.getName(line, 'Scenario')
            const scneario = new Scenario(name)

            this.features[this.currentFeature].scenarii.push(scneario)
        }

        if (this.isStep(line)) {
            const name = this.whatStep(line)
            const title = this.getStepTitle(line, name)

            this.features[
                this.currentFeature
            ].scenarii[
                this.currentScenario
            ].steps.push(new Step({
                name,
                title
            }))
        }
    }

    public finish() : Feature[] {
        return this.features
    }

    private getName(line: string, key: string): string {
        return line.split(`${key}:`)[1].trim()
    }

    private getStepTitle(line: string, key: string): string {
        return line.split(`${key}`)[1].trim()
    }

    private isStep(line: string): boolean {
        return Object
            .values(stepNames)
            .some((value) => {
                return line.includes(value)
            })
    }

    private whatStep(line: string) {
        const foundStep = Object
            .values(stepNames)
            .filter((value) => {
                return line.includes(value)
            })

        return foundStep[0]
    }
}