export abstract class Taggable {
    public tags: string[] = []

    public matchTags(tags: string[]): boolean {
        return this.tags.some((tag) => tags.includes(tag))
    }
}
