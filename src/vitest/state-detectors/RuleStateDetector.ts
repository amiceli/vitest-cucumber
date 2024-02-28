import { Rule } from "../../parser/Rule"
import { ScenarioParentStatsDetector } from "./ScenarioParentStatsDetector"

export class RuleStateDetector extends ScenarioParentStatsDetector<Rule> {

    private readonly rule: Rule

    private constructor (rule: Rule, excludeTags : string[]) {
        super(rule, excludeTags)
        this.rule = rule
    }

    public static forRule (rule: Rule, excludeTags : string[]) {
        return new RuleStateDetector(rule, excludeTags)
    }

}