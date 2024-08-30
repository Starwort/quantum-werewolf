import {PlayerInfo, Role} from "./App";

export function* permute<T>(permutation: T[]) {
    var length = permutation.length,
        c = new Array(length).fill(0),
        i = 1, k, p;
    yield permutation.slice();
    permutation = permutation.slice();

    while (i < length) {
        if (c[i] < i) {
            k = i % 2 && c[i];
            p = permutation[i];
            permutation[i] = permutation[k];
            permutation[k] = p;
            ++c[i];
            i = 1;
            yield permutation.slice();
        } else {
            c[i] = 0;
            ++i;
        }
    }
}
export function shuffle<T>(array: T[]) {
    for (let i = array.length; i-- > 0;) {
        let toSwap = Math.floor(Math.random() * (i + 1));
        [array[i], array[toSwap]] = [array[toSwap], array[i]];
    }
    return array;
}
export function isDominantWolf(player: number, possibility: PlayerInfo[]) {
    if (!possibility[player].role.startsWith("wolf") || !possibility[player].alive) {
        return false;
    }
    return possibility.filter(
        p => p.role.startsWith("wolf") && p.alive && p.role < possibility[player].role
    ).length == 0;
}
export function categorise(role: Role): "good" | "evil" {
    if (role == "seer" || role == "villager") {
        return "good";
    }
    return "evil";
}