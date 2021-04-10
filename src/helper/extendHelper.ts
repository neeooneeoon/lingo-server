export class ExtendHelper {
    public getReplaceCharacter(character: string): string {
        const groups: string[] = ["aeiou", "bcpdq", "ghfjk", "lmn", "rstvwxz", "yij"];
        for (const group of groups) {
            if (group.includes(character.toLowerCase())) {
                const characters = group.split("").filter(c => c != character.toLowerCase());
                if (character == character.toUpperCase())
                    return characters[Math.floor(Math.random() * character.length)].toUpperCase();
                else
                    return characters[Math.floor(Math.random() * character.length)];
            }
        }
        return ''
    }
}