declare module 'parsecurrency' {
    export type ParsedCurrency = {
        raw: string
        value: number
        integer: string
        decimals: string
        currency: string
        symbol: string
        decimalSeparator: string
        groupSeparator: string
    }

    export default function parsecurrency(
        currency: string,
    ): ParsedCurrency | null
}
