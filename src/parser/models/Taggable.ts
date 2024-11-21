import type { TagFilterItem, TagFilters } from '../../vitest/configuration'

const matchFilter = (filterItem: TagFilterItem, tags: Set<string>) => {
    if (Array.isArray(filterItem)) {
        return filterItem.every((item) => tags.has(item))
    }

    return tags.has(filterItem)
}

export abstract class Taggable {
    public tags = new Set<string>()

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

    public shouldBeCalled(options: TagFilters): boolean {
        return (
            (options.includeTags.length <= 0 ||
                this.matchTags(options.includeTags) === true) &&
            this.matchTags(options.excludeTags) === false
        )
    }
}
