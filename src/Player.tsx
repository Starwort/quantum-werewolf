import {Button, Card, CardActions, CardContent, CardHeader, FormControl, InputLabel, List, ListItem, ListItemButton, ListItemText, MenuItem, Select, Table, TableCell, TableContainer, TableHead, TableRow, Typography} from '@suid/material';
import {For, Match, Setter, Show, Switch, createEffect, createSignal} from 'solid-js';
import {PlayerInfo} from './App';
import {categorise, isDominantWolf} from './util';

export function Player(props: {
    players: string[];
    possibilities: PlayerInfo[][];
    updatePossibilities: Setter<PlayerInfo[][]>;
    addToHistory: (item: string) => void;
    queuedActions: ({
        seerTarget: number | null;
        seerResult: "good" | "evil" | null;
        wolfTarget: number;
    } | null)[];
    setQueuedActions: Setter<({
        seerTarget: number | null;
        seerResult: "good" | "evil" | null;
        wolfTarget: number;
    } | null)[]>;
    onMorning: () => void;
}) {
    const [currentPlayer, setCurrentPlayer] = createSignal<[number, 0 | 1 | 2] | null>(null);
    const [seerTarget, setSeerTarget] = createSignal<number>(-1);
    const [wolfTarget, setWolfTarget] = createSignal<number>(-1);
    // createEffect(() => {
    //     if (!props.queuedActions.some(a => a === null)) {
    //         props.updatePossibilities(
    //             possibilities => possibilities.filter(
    //                 possibility => props.queuedActions.every(
    //                     (action, player) => isActionPossible(possibility, player, action!)
    //                 )
    //             )
    //         ).map(() => null);
    //         props.setQueuedActions(props.players.map(() => null));
    //     }
    // });
    createEffect(() => console.log(props.queuedActions));
    return <Card sx={{width: "75%", maxWidth: 600}}>
        <Show when={currentPlayer()}>{(currentPlayer) => (
            <Switch>
                <Match when={currentPlayer()[1] == 0}>
                    <CardHeader title={`For ${props.players[currentPlayer()[0]]}'s eyes only`} />
                    <CardActions>
                        <Button onClick={() => setCurrentPlayer(
                            player => [player![0], 1]
                        )}>Reveal</Button>
                    </CardActions>
                </Match>
                <Match when={currentPlayer()[1] == 1}>
                    <CardHeader title={props.players[currentPlayer()[0]]} />
                    <CardContent sx={{gap: 2, display: "flex", flexDirection: "column"}}>
                        <PlayerRoleOdds player={currentPlayer()[0]} possibilities={props.possibilities} />
                        <FormControl fullWidth>
                            <InputLabel>Seer Target</InputLabel>
                            <Select
                                label="Seer Target"
                                value={seerTarget()}
                                onChange={e => setSeerTarget(+e.target.value)}
                            >
                                <MenuItem value={-1}>No target</MenuItem>
                                <For each={props.players}>{(player, i) => (
                                    i() != currentPlayer()[0] && <MenuItem value={i()}>{player}</MenuItem>
                                )}</For>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Wolf Target</InputLabel>
                            <Select
                                label="Wolf Target"
                                value={wolfTarget()}
                                onChange={e => setWolfTarget(+e.target.value)}
                            >
                                <For each={props.players}>{(player, i) => (
                                    i() != currentPlayer()[0] && <MenuItem value={i()}>{player}</MenuItem>
                                )}</For>
                            </Select>
                        </FormControl>
                    </CardContent>
                    <CardActions>
                        <Button
                            disabled={wolfTarget() == -1}
                            onClick={() => {
                                let i = seerTarget();
                                let target: number | null;
                                let seerResult: "good" | "evil" | null;
                                if (i == -1) {
                                    target = null;
                                    seerResult = null;
                                } else {
                                    target = i;
                                    seerResult = props.possibilities.reduce(
                                        (acc: number, poss) =>
                                            acc + +(poss[i].role == "villager" || poss[i].role == "seer"),
                                        0
                                    ) > Math.random() * props.possibilities.length ? "good" as const : "evil" as const;
                                }
                                let newActions = props.queuedActions.slice();
                                newActions[currentPlayer()[0]] = {
                                    seerTarget: target,
                                    seerResult,
                                    wolfTarget: wolfTarget(),
                                };
                                props.addToHistory(
                                    `${props.players[currentPlayer()[0]]} (Seer: ${(
                                        props.possibilities.filter(
                                            p => p[currentPlayer()[0]].role == "seer"
                                        ).length / props.possibilities.length * 100
                                    ).toFixed(2)}%) sees ${target === null ? "nobody" : props.players[target]} as ${seerResult ?? "nothing"}`
                                );
                                props.addToHistory(
                                    `${props.players[currentPlayer()[0]]} (Dominant wolf: ${(
                                        props.possibilities.filter(
                                            p => isDominantWolf(currentPlayer()[0], p)
                                        ).length / props.possibilities.length * 100
                                    ).toFixed(2)}%) murders ${props.players[wolfTarget()]}`
                                );
                                props.setQueuedActions(newActions);
                                if (target !== null) {
                                    setCurrentPlayer(player => [player![0], 2]);
                                } else {
                                    setCurrentPlayer(null);
                                }
                                setSeerTarget(-1);
                                setWolfTarget(-1);
                            }}
                        >Submit</Button>
                    </CardActions>
                </Match>
                <Match when={currentPlayer()[1] == 2}>
                    <CardHeader title={props.players[currentPlayer()[0]]} />
                    <CardContent>
                        You observe {props.players[props.queuedActions[currentPlayer()[0]]!.seerTarget!]} and see that they are {props.queuedActions[currentPlayer()[0]]!.seerResult}.
                    </CardContent>
                    <CardActions>
                        <Button onClick={() => setCurrentPlayer(null)}>OK</Button>
                    </CardActions>
                </Match>
            </Switch>
        )}</Show>
        <Show when={!currentPlayer()}>
            <List sx={{width: "100%"}}>
                <For each={props.players}>{(player, i) => (
                    <ListItem secondaryAction={
                        <Switch fallback={
                            <Button onClick={() => setCurrentPlayer([i(), 0])}>Wake up</Button>
                        }>
                            <Match when={props.possibilities.filter(p => p[i()].alive).length == 0}>
                                <Button
                                    disabled={props.queuedActions[i()] != null}
                                    onClick={() => props.setQueuedActions(
                                        actions => actions.map((a, j) => j == i() ? {
                                            seerTarget: null,
                                            seerResult: null,
                                            wolfTarget: 0,
                                        } : a)
                                    )}
                                >Dead</Button>
                            </Match>
                            <Match when={props.queuedActions[i()]}>
                                <Button disabled>Asleep</Button>
                            </Match>
                        </Switch>
                    }>
                        <ListItemText primary={player} />
                    </ListItem>
                )}</For>
                <ListItem disableGutters>
                    <ListItemButton
                        disabled={props.queuedActions.some(a => a === null)}
                        onClick={() => {
                            props.updatePossibilities(
                                possibilities => possibilities.filter(
                                    possibility => props.queuedActions.every(
                                        (action, player) => isActionPossible(possibility, player, action!)
                                    )
                                )
                            ).map(() => null);
                            props.setQueuedActions(props.players.map(() => null));
                            props.onMorning();
                        }}
                    >
                        <ListItemText primary="To morning" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Show>
    </Card>;
}

function PlayerRoleOdds(props: {player: number; possibilities: PlayerInfo[][];}) {
    let results = () => props.possibilities.reduce(
        (acc: number[], poss) => {
            if (poss[props.player].role == "seer") {
                acc[0]++;
            } else if (poss[props.player].role == "villager") {
                acc[1]++;
            } else {
                acc[3 + +poss[props.player].role.replace("wolf", "")]++;
            }
            if (!poss[props.player].alive) {
                acc[2]++;
            }
            return acc;
        },
        [0, 0, 0, ...props.possibilities[0].filter(r => r.role.startsWith("wolf")).map(() => 0)]
    );
    let shouldShowRole = () => {
        let possibilities = results().slice();
        possibilities.splice(2, 1);
        let foundOneRole = false;
        for (let possibleRole of possibilities) {
            if (possibleRole > 0) {
                if (foundOneRole) {
                    return false;
                }
                foundOneRole = true;
            }
        }
        return foundOneRole;
    };
    return <>
        <Show when={shouldShowRole()} fallback={<>
            <TableContainer>
                <Table sx={{width: "100%"}}>
                    <TableHead>
                        <TableRow>
                            <TableCell align="right">Innocent</TableCell>
                            <TableCell align="right">Wolf</TableCell>
                            <TableCell align="right">Dead</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableRow>
                        <TableCell align="right">{((results()[0] + results()[1]) / props.possibilities.length * 100).toFixed(2)}%</TableCell>
                        <TableCell align="right">{(results().slice(3).reduce((a, b) => a + b) / props.possibilities.length * 100).toFixed(2)}%</TableCell>
                        <TableCell align="right">{(results()[2] / props.possibilities.length * 100).toFixed(2)}%</TableCell>
                    </TableRow>
                </Table>
            </TableContainer>
        </>}>
            <Typography variant="body1">
                Your role: {props.possibilities[0][props.player].role.replace("wolf", "wolf #")}
            </Typography>
            <Typography variant="body1">
                Chance of being dead: {results()[2]}
            </Typography>
        </Show>
    </>;
}
function isActionPossible(
    possibility: PlayerInfo[],
    player: number,
    action: {
        seerTarget: number | null;
        seerResult: "good" | "evil" | null;
        wolfTarget: number;
    }
) {
    if (
        possibility[player].role == "seer"
        && action.seerTarget !== null
        && categorise(possibility[action.seerTarget].role) != action.seerResult
    ) {
        return false;
    }
    if (isDominantWolf(player, possibility)) {
        if (possibility[action.wolfTarget].role.startsWith("wolf")) {
            return false;
        } else {
            possibility[action.wolfTarget].alive = false;
        }
    }
    return true;
}

