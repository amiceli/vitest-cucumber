import { Rule } from "../../parser/Rule"
import { ScenarioParentStatsDetector } from "./ScenarioParentStatsDetector"

export class RuleStateDetector extends ScenarioParentStatsDetector<Rule> {

    private readonly rule: Rule

    private readonly excludeTags : string[]

    private constructor (rule: Rule, excludeTags : string[]) {
        super(rule)
        this.rule = rule
        this.excludeTags = excludeTags
    }

    public static forRule (rule: Rule, excludeTags : string[]) {
        return new RuleStateDetector(rule, excludeTags)
    }

}