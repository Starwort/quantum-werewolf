import {Button, Card, FormControlLabel, Switch, Table, TableCell, TableContainer, TableHead, TableRow} from '@suid/material';
import {For, Setter, Show, createEffect, createSignal} from 'solid-js';
import {PlayerInfo} from './App';
import {shuffle} from './util';

export function Overview(props: {
    players: string[];
    possibilities: PlayerInfo[][];
    updatePossibilities: Setter<PlayerInfo[][]>;
}) {
    const [playerView, setPlayerView] = createSignal(true);
    const headers = () => playerView() ? ["Innocent", "Wolf", "Dead"] : [
        "Seer", "Villager", "Dead",
        ...props.possibilities[0].filter(
            p => p.role.startsWith("wolf")
        ).map(
            p => p.role.replace("wolf", "Wolf ")
        ).sort(),
    ];
    const fullData = (): [string, ...number[]][] => props.players.map((player, i) => {
        let results = props.possibilities.reduce(
            (acc: number[], poss) => {
                if (poss[i].role == "seer") {
                    acc[0]++;
                } else if (poss[i].role == "villager") {
                    acc[1]++;
                } else {
                    acc[3 + +poss[i].role.replace("wolf", "")]++;
                }
                if (!poss[i].alive) {
                    acc[2]++;
                }
                return acc;
            },
            [0, 0, 0, ...props.possibilities[0].filter(r => r.role.startsWith("wolf")).map(() => 0)]
        );
        return [
            player, ...results,
        ];
    });
    createEffect(() => {
        let poss = props.possibilities;
        let playersToUpdate: string[] = [];
        for (let [player, seer, villager, dead, ...wolves] of fullData()) {
            if (
                dead == poss.length
                && [seer, villager, ...wolves].some(
                    r => r != 0 && r != poss.length
                )
            ) {
                playersToUpdate.push(player);
            }
        }
        if (playersToUpdate.length) {
            let possToAffix = poss[Math.floor(Math.random() * poss.length)];
            let playerIdxs = props.players.map((p, i) => playersToUpdate.includes(p) ? i : -1).filter(p => p != -1);
            props.updatePossibilities(
                possibilities => possibilities.filter(
                    poss => playerIdxs.every(
                        i => poss[i].role == possToAffix[i].role
                    )
                )
            );
        }
    });
    const data = () => playerView()
        ? shuffle(fullData().map(([_, s, v, d, ...w]) => [s + v, w.reduce((a, b) => a + b, 0), d]))
        : fullData();
    return <>
        <FormControlLabel
            control={<Switch defaultChecked onChange={(e) => setPlayerView(e.target.checked)} />}
            label="Show player view"
        />
        <TableContainer component={Card} sx={{width: "75%", maxWidth: 600}}>
            <Table sx={{width: "100%"}}>
                <TableHead>
                    <TableRow>
                        <Show when={!playerView()}>
                            <TableCell>Player</TableCell>
                        </Show>
                        <For each={headers()}>{header => (
                            <TableCell align="right">{header}</TableCell>
                        )}</For>
                        <Show when={!playerView()}>
                            <TableCell></TableCell>
                        </Show>
                    </TableRow>
                </TableHead>
                <For each={data()}>{(row, i) => (
                    <TableRow>
                        <For each={row}>{(cell, i) => (
                            <TableCell align={i() || playerView() ? "right" : undefined}>
                                {format(cell, props.possibilities.length)}
                            </TableCell>
                        )}</For>
                        <Show when={!playerView()}>
                            <TableCell>
                                <Button onClick={() => {
                                    props.updatePossibilities(
                                        poss => poss.filter(
                                            poss => poss[i()].alive
                                        ).map(
                                            poss => poss.map((p, j) => ({
                                                ...p,
                                                alive: p.alive && j != i(),
                                            }))
                                        )
                                    );
                                }}>
                                    Lynch
                                </Button>
                            </TableCell>
                        </Show>
                    </TableRow>
                )}</For>
            </Table>
        </TableContainer>
    </>;
}

function format(cell: string | number, possCount: number) {
    return typeof cell == "number" ? `${(cell / possCount * 100).toFixed(2)}%` : cell;
}