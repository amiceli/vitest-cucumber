import { Rule } from "../../parser/Rule"
import { ScenarioParentStatsDetector } from "./ScenarioParentStatsDetector"

export class RuleStateDetector extends ScenarioParentStatsDetector<Rule> {

    private readonly rule: Rule

    private constructor (rule: Rule) {
        super(rule)
        this.rule = rule
    }

    public static forRule (rule: Rule) {
        return new RuleStateDetector(rule)
    }

}