import {Add, Delete, Edit} from '@suid/icons-material';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, TextField} from '@suid/material';
import {For, Setter, createSignal} from 'solid-js';
import {PlayerInfo, Role} from './App';
import {permute} from './util';

const N_WEREWOLVES = {
    5: 1,
    6: 1,
    7: 1,
    8: 2,
    9: 2,
    10: 2,
    11: 2,
    12: 3,
    13: 3,
    14: 3,
    15: 3,
    16: 3,
    17: 3,
    18: 3,
};

export function Admin(props: {
    players: string[];
    setPlayers: Setter<string[]>;
    possibilities: PlayerInfo[][];
    setPossibilities: (val: PlayerInfo[][]) => void;
    setQueuedActions: Setter<({
        seerTarget: number | null;
        seerResult: "good" | "evil" | null;
        wolfTarget: number;
    } | null)[]>;
}) {
    function generatePossibilities(players: string[]): PlayerInfo[][] {
        function* assignRoles(roles: PlayerInfo[], perm: Role[], start: number): Generator<PlayerInfo[]> {
            for (let i = start; i < roles.length; i++) {
                roles[i] = {role: perm[0], alive: true};
                if (perm.length > 1) {
                    yield* assignRoles(roles, perm.slice(1), i + 1);
                } else {
                    yield roles;
                }
                roles[i] = {role: "villager", alive: true};
            }
        }
        let wolves = new Array(
            N_WEREWOLVES[players.length as keyof typeof N_WEREWOLVES]
        ).fill("wolf").map((_, i): Role => `wolf${i}`);
        let roles: Role[] = ["seer", ...wolves];
        let result: PlayerInfo[][] = [];
        for (let perm of permute(roles)) {
            for (let roles of assignRoles(players.map(() => ({
                role: "villager",
                alive: true,
            })), perm, 0)) {
                result.push(roles.slice());
            }
        }
        return result;
    }
    const [editingName, setEditingName] = createSignal<number | null>(null);
    const [currentName, setCurrentName] = createSignal("");

    return <>
        <List sx={{width: "75%", maxWidth: 600}}>
            <For each={props.players}>{(player, i) => (
                <ListItem secondaryAction={<IconButton color="error" onClick={() => {
                    props.setPlayers(players => {
                        const newPlayers = [...players];
                        newPlayers.splice(i(), 1);
                        return newPlayers;
                    });
                    props.setPossibilities([]);
                }}>
                    <Delete />
                </IconButton>}>
                    <ListItemButton onClick={() => {
                        setEditingName(i());
                        setCurrentName(player);
                    }}>
                        <ListItemIcon>
                            <Edit />
                        </ListItemIcon>
                        <ListItemText primary={player} />
                    </ListItemButton>
                </ListItem>
            )}</For>
            <ListItem>
                <ListItemButton onClick={() => {
                    props.setPlayers(players => [
                        ...players,
                        `Player ${players.length + 1}`
                    ]);
                    props.setPossibilities([]);
                }}>
                    <ListItemIcon>
                        <Add />
                    </ListItemIcon>
                    <ListItemText primary="Add Player" />
                </ListItemButton>
            </ListItem>
            <ListItem>
                <ListItemButton
                    disabled={props.players.length < 5}
                    onClick={() => {
                        props.setPossibilities(
                            generatePossibilities(props.players)
                        );
                        props.setQueuedActions(props.players.map(() => null));
                    }}
                >
                    <ListItemText inset primary="Generate possibilities" />
                </ListItemButton>
            </ListItem>
        </List>
        <Dialog open={editingName() !== null} onClose={() => setEditingName(null)}>
            <DialogTitle>Edit Player Name</DialogTitle>
            <DialogContent>
                <TextField value={currentName()} onChange={e => setCurrentName(e.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    props.setPlayers(players => {
                        const newPlayers = [...players];
                        newPlayers[editingName()!] = currentName();
                        return newPlayers;
                    });
                    setEditingName(null);
                }}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    </>;
}

