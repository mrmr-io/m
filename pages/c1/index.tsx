import type p5Types from "p5";
import Sketch from "p5/Sketch";
import { VideoRecorder } from "p5/VideoRecorder";
import * as React from "react";
import styled from "styled-components";
import { isDevelopment } from "utils/debug";
import { draw, setup } from "./sketch";

export const Content: React.FC = () => {
    return (
        <Grid>
            <SketchBox />
        </Grid>
    );
};

const Grid = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100svh;
`;

const enableTestRecording = false;

const SketchBox: React.FC = () => {
    const [recorder, _] = React.useState(new VideoRecorder());

    const height = 500;
    const aspectRatio = 9 / 16;
    const width = height * aspectRatio;

    const wrappedSetup = (p5: p5Types, canvasParentRef: Element) => {
        // Use the `parent` method to ask p5 render to the provided canvas ref
        // instead of creating and rendering to a canvas of its own.
        p5.createCanvas(width, height).parent(canvasParentRef);

        if (isDevelopment() && enableTestRecording) {
            setTimeout(() => {
                recorder.start();
            }, 5000);

            setTimeout(() => {
                recorder.stopAndSave();
            }, 10000);
        }

        setup(p5);
    };

    return <Sketch setup={wrappedSetup} draw={draw} />;
};
