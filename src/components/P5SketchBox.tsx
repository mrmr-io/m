import type { P5CanvasInstance, Sketch } from "@p5-wrapper/react";
import type p5 from "p5";
import ReactP5Wrapper from "p5/ReactP5Wrapper";
import * as React from "react";
import type { P5Draw } from "types";

export interface P5SketchBoxProps {
    /**
     * The draw function to render the P5 sketch.
     */
    draw: P5Draw;

    /**
     * A function that is called to determine the size of the sketch.
     *
     * It should return a pair of numbers, representing the width and the height
     * of the box.
     */
    computeSize: (p5: p5) => [number, number];

    /**
     * A ref to the P5 instance that'll be set by {@link P5SketchBox} when setup
     * is first called.
     *
     * This ref can then subsequently be used to perform actions on the P5
     * object externally. e.g. it can be used to resume looping.
     */
    p5Ref?: React.MutableRefObject<P5CanvasInstance | undefined>;

    /**
     * If true, then disable looping the draw function by calling the P5
     * `noLoop` function during setup.
     *
     * This is useful for sketches that are linked to audio. For such sketches,
     * the animations can be initially disabled, and re-enabled (using
     * {@link p5Ref}) when the user starts the audio so that the frameCount
     * moves in a deterministic sync with the audio being played.
     */
    shouldDisableLooping?: boolean;

    /**
     * The audio context in which audio is being (or will be) played.
     *
     * This will be undefined both (a) if the sketch does not have any
     * associated audio, or (b) if the sketch does indeed have audio, but
     * playback has not started at least once.
     */
    audioContext?: AudioContext;
}

/**
 * A container showing a P5 sketch
 *
 * This is meant to be an relatively generic component, and usually you'd want
 * to use one which handles the sizing for you. e.g. a `ReelSizedP5SketchBox`
 * or a `SquareP5Sketch`.
 *
 * It however has various hooks and controls to allow us to synchronize with an
 * audio source.
 */
export const P5SketchBox: React.FC<P5SketchBoxProps> = ({
    draw,
    computeSize,
    p5Ref,
    shouldDisableLooping,
    audioContext,
}) => {
    const setup = (p5: p5) => {
        const [width, height] = computeSize(p5);

        // Save a reference to the p5 instance if we were asked to.
        if (p5Ref) p5Ref.current = p5;

        // Calling noLoop will ask P5 to call draw once, and then stop. So we'll
        // still see the rendered sketch, but animations (or more generally,
        // subsequent draw calls) will be stopped.
        if (shouldDisableLooping === true) p5.noLoop();

        // Create and return a new canvas that'll be used by the ReactP5Wrapper
        // library that we're using.
        return p5.createCanvas(width, height);
    };

    const windowResized = (p5: P5CanvasInstance) => {
        const [width, height] = computeSize(p5);

        p5.resizeCanvas(width, height);
    };

    const env = {
        audioTime: () => {
            return audioContext?.currentTime ?? 0;
        },
        pageTime: () => {
            // `performance.now` is in milliseconds. convert it to seconds so
            // that we have the same external interface as `audioTime` above.
            return performance.now() / 1000;
        },
    };

    const sketch: Sketch = (p5) => {
        p5.setup = () => setup(p5);
        p5.draw = () => draw(p5, env);
    };

    // TODO: XXX
    // windowResized={windowResized}
    return <ReactP5Wrapper sketch={sketch} />;
};
