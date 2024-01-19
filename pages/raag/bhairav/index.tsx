import { initAudioOnFirstClick, superdough } from "@strudel/webaudio";
import { WideColumn } from "components/Column";
import * as React from "react";
import { initStrudel } from "strudel/init";
import styled from "styled-components";

/* More like thaat, but let's live with this for now */
interface Raag {
    name: string;
    nameInDevanagri: string;
    /** This is the number of semitones from the tonic (root, Sa). */
    notes: number[];
}

const raagBhairav: Raag = {
    name: "Bhairav",
    nameInDevanagri: "भैरव",
    notes: [0, 1, 4, 5, 7, 8, 11],
};

export const Content: React.FC = () => {
    return <RaagContent raag={raagBhairav} />;
};

interface PropsWithRaag {
    raag: Raag;
}

export const RaagContent: React.FC<PropsWithRaag> = ({ raag }) => {
    React.useEffect(() => {
        initAudioOnFirstClick();
        initStrudel();
    }, []);

    return (
        <RaagContent_>
            <WideColumn>
                <RaagName raag={raag} />
                <Raag raag={raag} />
                <TextContent>
                    <Description raag={raag} />
                </TextContent>
            </WideColumn>
        </RaagContent_>
    );
};

const RaagContent_ = styled.div`
    /* Use a large font as the base */
    font-size: 22px;
`;

const RaagName: React.FC<PropsWithRaag> = ({ raag }) => {
    return (
        <RaagName_>
            <h1>
                <T1>ra'g</T1> {raag.name.toLowerCase()}
            </h1>
            <big>
                <T1>राग</T1> {raag.nameInDevanagri}
            </big>
        </RaagName_>
    );
};

const RaagName_ = styled.div`
    font-family: serif;
    font-style: italic;

    h1 {
        font-size: 2.25em;
        margin-block-end: 0.1em;
    }
    big {
        margin-inline-start: -1px;
    }
`;

const T1 = styled.span`
    color: var(--mrmr-color-4);
`;

const Raag: React.FC<PropsWithRaag> = ({ raag }) => {
    return (
        <Raag_>
            {noteSequence(raag.notes).map(([i, isOn]) =>
                isOn ? (
                    <Note key={i} noteOffset={i} />
                ) : (
                    <Blank key={i} noteOffset={i} />
                ),
            )}
        </Raag_>
    );
};

const Raag_ = styled.div`
    box-sizing: border-box;
    margin-block-start: -1rem;
    /* padding-block: 1rem; */
    min-height: 80svh;
    display: flex;
    flex-direction: column;
    align-items: end;
    gap: 4px;
    justify-content: space-evenly;

    & > div {
        width: 50%;
        /* Don't let anything shrink */
        flex-shrink: 0;
        /* Give all the items a fixed height */
        flex-basis: 12px;
        border-radius: 4px;
    }
`;

const noteSequence = (notes: number[]): [number, boolean][] => {
    const seq: [number, boolean][] = [];
    for (let i = 0; i < 12; i++) {
        seq.push([i, notes.includes(i)]);
    }
    return seq.reverse();
};

interface NoteProps {
    /** How many semitones away from the root is this note */
    noteOffset: number;
}

const Note: React.FC<NoteProps> = ({ noteOffset }) => {
    const playNote = () => {
        superdough({ s: "sine", note: 69 + noteOffset }, 0, 0.125);
    };
    return (
        <Note_
            onClick={playNote}
            style={{ marginInlineEnd: `${(12 - noteOffset) * 8}px` }}
        />
    );
};

const Note_ = styled.div`
    background-color: var(--mrmr-color-4);

    &:hover {
        background-color: var(--mrmr-color-3);
    }
`;

const Blank: React.FC<NoteProps> = ({ noteOffset }) => {
    return <Blank_ style={{ marginInlineEnd: `${(12 - noteOffset) * 8}px` }} />;
};

const Blank_ = styled.div`
    background-color: var(--mrmr-color-4);

    opacity: 0.2;
`;

const Description: React.FC<PropsWithRaag> = ({ raag }) => {
    return (
        <div>
            <p>
                Raagas are like scales (<i>not really</i>, they're more like
                Markov chains, but thinking of them as scales is a good first
                approximation).
            </p>
            <p>
                {`Above you can see the distance between notes on Raag
                ${raag.name}. Hover on them to hear how they sound (tap once to
                 enable audio).`}
            </p>
        </div>
    );
};

const TextContent = styled.div`
    padding-block: 1px;
`;
