import { type ArrowFunction, type CallExpression, SyntaxKind } from 'ts-morph'
import { generateScenarii } from '../../../scripts/generateFile'
import type { Scenario, ScenarioParent } from '../../parser/models'
import { type AstOptions, BaseAst } from './BaseAst'
import { isString } from './ast-utils'

type ScenarioAstOptions = AstOptions & {
    scenarioParent: ScenarioParent
    scenarioParentFunction: ArrowFunction
}

type ScenarioExpression = {
    name: string
    callExpression: CallExpression
}

export class ScenarioAst extends BaseAst {
    private scenarioParent: ScenarioParent

    private scenarioParentFunction: ArrowFunction

    private constructor(options: ScenarioAstOptions) {
        super(options)

        this.scenarioParent = options.scenarioParent
        this.scenarioParentFunction = options.scenarioParentFunction
    }

    public static fromOptions(options: ScenarioAstOptions): ScenarioAst {
        return new ScenarioAst(options)
    }

    public handleScenarii() {
        const parentScenarii = this.getParentArrowScenarii()

        const missingScenarii = this.getMissingScenarri(parentScenarii)
        const shouldBeRemoved = this.getScenariiToRemove(parentScenarii)

        for (const s of shouldBeRemoved) {
            this.scenarioParentFunction.removeStatement(
                s.callExpression.getChildIndex(),
            )
        }

        this.scenarioParentFunction.addStatements(
            generateScenarii(missingScenarii || []),
        )
    }

    private getScenariiToRemove(
        parentScenarii: ScenarioExpression[],
    ): ScenarioExpression[] {
        return parentScenarii.filter((scenario) => {
            return (
                scenario.name &&
                this.scenarioParent.scenarii
                    .map((s) => s.description)
                    .includes(scenario.name) === false
            )
        })
    }

    private getMissingScenarri(
        parentScenarii: ScenarioExpression[],
    ): Scenario[] {
        return this.scenarioParent.scenarii.filter((scenario) => {
            return (
                parentScenarii
                    .map((s) => s.name)
                    .includes(scenario.description) === false
            )
        })
    }

    private getParentArrowScenarii(): ScenarioExpression[] {
        return this.scenarioParentFunction
            .getDescendantsOfKind(SyntaxKind.CallExpression)
            .filter((call) => call.getText().includes('Scenario('))
            .map((callExpression) => {
                return {
                    name: callExpression
                        .getArguments()
                        .find((arg) => isString(arg.getKind()))
                        ?.getText()
                        .replace(/^['"`]|['"`]$/g, ''),
                    callExpression,
                }
            })
            .filter(
                (scenario): scenario is ScenarioExpression =>
                    scenario?.name !== undefined,
            )
    }
}
