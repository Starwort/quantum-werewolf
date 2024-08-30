import DarkMode from '@suid/icons-material/DarkMode';
import Heart from '@suid/icons-material/Favorite';
import LightMode from '@suid/icons-material/LightMode';
import {AppBar, Box, CssBaseline, IconButton, List, ListItem, ListItemText, ThemeProvider, ToggleButton, ToggleButtonGroup, Toolbar, Typography, createPalette, createTheme} from '@suid/material';
import {For, Match, Show, Switch, createEffect, createMemo, createSignal, type Component} from 'solid-js';
import {Admin} from './Admin';
import {Overview} from './Overview';
import {Player} from './Player';
import {GitHub} from './extra_icons';

export type Role = "seer" | `wolf${number}` | "villager";

export type PlayerInfo = {
    role: Role;
    alive: boolean;
};

const App: Component = () => {
    const [themeColour, setThemeColour] = createSignal<"dark" | "light">(
        window.localStorage.theme === "light" ? "light" : "dark"
    );
    createEffect(() => {
        window.localStorage.theme = themeColour();
    });
    const palette = createMemo(() =>
        createPalette({
            mode: themeColour(),
            primary: {
                main: themeColour() == "dark" ? "#bb86fc" : "#6200ee",
            },
            secondary: {
                main: "#03dac6",
            },
        })
    );
    const theme = createTheme({palette});
    const [tab, setTab] = createSignal<"admin" | "overview" | "history" | "player">("admin");
    const [players, setPlayers] = createSignal<string[]>([]);
    const [history, setHistory] = createSignal<string[]>([]);
    const [possibilities, setPossibilities] = createSignal<PlayerInfo[][]>([]);
    const [queuedActions, setQueuedActions] = createSignal<({
        seerTarget: number | null;
        seerResult: "good" | "evil" | null;
        wolfTarget: number;
    } | null)[]>([]);
    return <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar>
            <Toolbar sx={{gap: 1}}>
                <Typography variant="h5" component="h1" sx={{flexGrow: 1}}>
                    Quantum Werewolf Moderator Panel
                </Typography>
                <IconButton
                    component="a"
                    href="https://ko-fi.com/starwort"
                    color="inherit"
                    title="Donate"
                >
                    <Heart />
                </IconButton>
                <IconButton
                    component="a"
                    href="https://github.com/Starwort/quantum-werewolf/"
                    color="inherit"
                    title="Source"
                >
                    <GitHub />
                </IconButton>
                <IconButton
                    onClick={() => setThemeColour(
                        themeColour() == "dark" ? "light" : "dark"
                    )}
                    color="inherit"
                    title={themeColour() == "dark" ? "Light theme" : "Dark theme"}
                    edge="end"
                >
                    <Show when={themeColour() == "dark"} fallback={<DarkMode />}>
                        <LightMode />
                    </Show>
                </IconButton>
            </Toolbar>
        </AppBar>
        <Toolbar />
        <Box component="main" sx={{
            width: "100%",
            display: "flex",
            flexDirection: 'column',
            alignItems: "center",
            padding: 2,
            paddingBottom: 0,
        }}>
            <ToggleButtonGroup
                value={tab()}
                exclusive
                onChange={(_, newValue) => setTab(newValue)}
            >
                <ToggleButton value="admin">Admin</ToggleButton>
                <ToggleButton disabled={!possibilities().length} value="overview">Overview</ToggleButton>
                <ToggleButton disabled={!possibilities().length} value="player">Player</ToggleButton>
                <ToggleButton disabled={!possibilities().length} value="history">History</ToggleButton>
            </ToggleButtonGroup>
            <Switch>
                <Match when={tab() == "admin"}>
                    <Admin
                        players={players()}
                        setPlayers={setPlayers}
                        possibilities={possibilities()}
                        setPossibilities={(val) => {
                            setPossibilities(val);
                            setHistory([]);
                            if (val.length) {
                                setTab("overview");
                            }
                        }}
                        setQueuedActions={setQueuedActions}
                    />
                </Match>
                <Match when={tab() == "overview"}>
                    <Overview
                        players={players()}
                        possibilities={possibilities()}
                        updatePossibilities={setPossibilities}
                    />
                </Match>
                <Match when={tab() == "player"}>
                    <Player
                        queuedActions={queuedActions()}
                        setQueuedActions={setQueuedActions}
                        players={players()}
                        possibilities={possibilities()}
                        updatePossibilities={setPossibilities}
                        addToHistory={(item) => setHistory([...history(), item])}
                        onMorning={() => setTab("overview")}
                    />
                </Match>
                <Match when={tab() == "history"}>
                    <Typography variant="h4">History</Typography>
                    <List>
                        <For each={history()}>{(item) => (
                            <ListItem>
                                <ListItemText primary={item} />
                            </ListItem>
                        )}</For>
                    </List>
                </Match>
            </Switch>
        </Box>
    </ThemeProvider>;
};

export default App;
