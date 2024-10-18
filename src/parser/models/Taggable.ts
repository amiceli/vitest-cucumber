import type { TagFilterItem } from '../../vitest/configuration'

const matchFilter = (filterItem: TagFilterItem, tags: string[]) => {
    if (Array.isArray(filterItem)) {
        return filterItem.every((item) => tags.includes(item))
    }

    return tags.some((tag) => {
        return filterItem === tag
    })
}

export abstract class Taggable {
    public tags: string[] = []

    /**
     * Simple matching filter mostly following the cucumber expression tag rules,
     * e.g. `[["alpha", "beta"], "vitests", "another"]`
     * will be equivalent to:

     * (`@alpha` and `@beta`) or `@vitests` or `@another`
     */
    public matchTags(filterItems: TagFilterItem[]): boolean {
        return filterItems.some((filterItem) =>
            matchFilter(filterItem, this.tags),
        )
    }
}
