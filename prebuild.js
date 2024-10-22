const fs = require('node:fs')

async function main() {
    const response = await fetch(
        'https://raw.githubusercontent.com/cucumber/gherkin/1667cf8ed6920093ccf0ad1111bceb823ae43730/gherkin-languages.json',
    )
    const data = await response.json()

    for (const detailsPropertyName in data) {
        const details = data[detailsPropertyName]

        for (const propertyName in details) {
            if (propertyName === 'and') {
                continue
            }

            const property = details[propertyName]

            if (!Array.isArray(property)) {
                continue
            }

            details[propertyName] = property.filter((value) => value !== '* ')
        }
    }

    fs.writeFileSync('src/parser/lang/lang.json', JSON.stringify(data, null, 2))
}

main()
