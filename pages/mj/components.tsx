import * as React from "react";
import styled from "styled-components";
import { useAudioContext } from "webaudio/use-audio-context";

export const Container: React.FC<React.PropsWithChildren> = ({ children }) => {
    return <Container_>{children}</Container_>;
};

const Container_ = styled.div`
    /* On big enough screens, give ourselves an additional margin (the code
       layout that we use already provides a basic margin) */
    @media (min-width: 500px) {
        margin: 1em;
    }

    display: flex;
    flex-direction: column;
    gap: 4em;

    margin-block-end: 8em;
`;

export const Section: React.FC<React.PropsWithChildren> = ({ children }) => {
    return <Section_>{children}</Section_>;
};

const Section_ = styled.section`
    display: flex;
    flex-wrap: wrap;
`;

export const Box: React.FC<React.PropsWithChildren> = ({ children }) => {
    return <Box_>{children}</Box_>;
};

const Box_ = styled.section`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    column-gap: 2em;
    @media (min-width: 1000px) {
        column-gap: 5em;
    }
    align-items: center;
    margin-block-end: 1em;

    pre {
        margin-inline: 0;
    }
`;

export const Explanation: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    return <Explanation_>{children}</Explanation_>;
};

const Explanation_ = styled.div`
    max-width: 20em;

    ol {
        padding-inline-start: 1em;
    }
`;

export const SoundFirst: React.FC = () => {
    const audioContext = useAudioContext();
    const [oscNode, setOscNode] = React.useState<OscillatorNode | undefined>();

    const handleClick = () => {
        if (oscNode) {
            oscNode.stop();
            setOscNode(undefined);
        } else {
            const ctx = audioContext();
            const osc = new OscillatorNode(ctx);
            const mix = new GainNode(ctx, { gain: 0.1 });
            osc.connect(mix).connect(ctx.destination);
            osc.start();
            setOscNode(osc);
        }
    };

    return <button onClick={handleClick}>{oscNode ? "Pause" : "Play"}</button>;
};

export const SoundBeep: React.FC = () => {
    const audioContext = useAudioContext();
    const [oscNode, setOscNode] = React.useState<OscillatorNode | undefined>();

    const handleClick = () => {
        const ctx = audioContext();
        const beep = (duration: number, attack = 0.001, release = 0.1) => {
            const osc = new OscillatorNode(ctx);
            const env = new GainNode(ctx, { gain: 1 });
            const t = ctx.currentTime;
            // See: [Note: linearRampToValueAtTime alternative]
            env.gain.setValueCurveAtTime([0, 1], t, attack);
            env.gain.setTargetAtTime(0, t + attack + duration, release / 5);

            const mix = new GainNode(ctx, { gain: 0.1 });

            osc.connect(env).connect(mix).connect(ctx.destination);
            osc.start();
            osc.stop(t + attack + duration + release);

            setOscNode(osc);
            osc.onended = () => {
                setOscNode(undefined);
            };
        };

        beep(0.2);
    };

    return (
        <button onClick={handleClick}>{oscNode ? "Playing" : "Play"}</button>
    );
};

const beep = (
    ctx: AudioContext,
    duration: number,
    attack = 0.001,
    release = 0.1,
) => {
    const osc = new OscillatorNode(ctx);
    const env = new GainNode(ctx, { gain: 1 });
    const t = ctx.currentTime;
    env.gain.setValueCurveAtTime([0, 1], t, attack);
    env.gain.setTargetAtTime(0, t + attack + duration, release / 5);

    const mix = new GainNode(ctx, { gain: 0.1 });

    osc.connect(env).connect(mix).connect(ctx.destination);
    osc.start();
    osc.stop(t + attack + duration + release);
};

export const SoundBeeps: React.FC = () => {
    const audioContext = useAudioContext();
    const [intervalID, setIntervalID] = React.useState<number | undefined>();

    const handleClick = () => {
        if (intervalID) {
            clearInterval(intervalID);
            setIntervalID(undefined);
        } else {
            setIntervalID(
                window.setInterval(() => {
                    beep(audioContext(), 0.01);
                }, 1000 / 7),
            );
        }
    };

    return (
        <button onClick={handleClick}>{intervalID ? "Pause" : "Play"}</button>
    );
};

export const SoundEuclidean: React.FC = () => {
    const audioContext = useAudioContext();
    const [intervalID, setIntervalID] = React.useState<number | undefined>();

    const [seqIndex, setSeqIndex] = React.useState(0);
    const seq = [1, 0, 0, 1, 0, 0, 1, 0];

    const handleClick = () => {
        if (intervalID) {
            clearInterval(intervalID);
            setIntervalID(undefined);
        } else {
            setIntervalID(
                window.setInterval(
                    () => {
                        setSeqIndex((seqIndex) => (seqIndex + 1) % seq.length);
                    },
                    (1000 * 7) / 7,
                ),
            );
        }
    };

    // console.log(seqIndex);

    React.useEffect(() => {
        if (intervalID && seq[seqIndex] === 1) {
            // console.log("play");
            beep(audioContext(), 0.01);
        }
    }, [seqIndex]);

    return (
        <div>
            <E_>
                {seq.map((v, i) => (
                    <div
                        key={i}
                        className={
                            intervalID && v === 1 && i === seqIndex
                                ? "playing"
                                : ""
                        }
                    />
                ))}
            </E_>
            <button onClick={handleClick}>
                {intervalID ? "Pause" : "Play"}
            </button>
        </div>
    );
};

const E_ = styled.div`
    /* border: 1px solid tomato; */
    width: 40em;
    height: 100px;
    margin-block-end: 1em;

    display: flex;
    gap: 1em;

    & > div {
        width: 10px;
        border: 1px solid tomato;
    }

    & > div.playing {
        background-color: tomato;
    }
`;
