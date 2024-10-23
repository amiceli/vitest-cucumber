import {
    BuiltinParameterExpressionAlreadyExistsError,
    CustomParameterExpressionAlreadyExistsError,
} from '../../errors/errors'
import { builtInExpressionRegEx } from './ExpressionStep'
import { ExpressionRegex } from './regexes'

export type CustomParameterExpressionArgs<T> = {
    name: string
    regexp: RegExp
    transformer: (value: string) => T
}

class CustomExpressionRegex<T> extends ExpressionRegex<T> {
    public constructor(
        private readonly args: CustomParameterExpressionArgs<T>,
    ) {
        super({
            keyword: `{${args.name}}`,
            groupName: args.name,
            keywordRegex: new RegExp(`{${args.name}}`, `g`),
        })
    }

    public getRegex(index: number): string {
        return `(?<${this.groupName}${index}>${this.args.regexp.source})`
    }

    public getValue(str: string): T {
        return this.args.transformer(str)
    }
}

export const customExpressionRegEx: ExpressionRegex<unknown>[] = []

export const defineParameterExpression = <T>(
    args: CustomParameterExpressionArgs<T>,
): void => {
    if (customExpressionRegEx.some((r) => r.groupName === args.name)) {
        throw new CustomParameterExpressionAlreadyExistsError(args.name)
    }

    if (builtInExpressionRegEx.some((r) => r.groupName === args.name)) {
        throw new BuiltinParameterExpressionAlreadyExistsError(args.name)
    }

    customExpressionRegEx.push(new CustomExpressionRegex(args))
}
