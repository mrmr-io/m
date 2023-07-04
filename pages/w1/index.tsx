import { PlayButton } from "components/Buttons";
import { LoadingIndicator } from "components/LoadingIndicator";
import { Link } from "gatsby";
import type p5Types from "p5";
import Sketch from "p5/Sketch";
import { VideoRecorder } from "p5/VideoRecorder";
import * as React from "react";
import styled from "styled-components";
import { BuildTimePageContext } from "templates/page";
import { isDevelopment } from "utils/debug";
import { ensure } from "utils/ensure";
import { draw, setup } from "./sketch";

export const Content: React.FC = () => {
    // Track the user's intent (whether or not they've pressed the play button).
    // Whether or not we're actually playing right now (`isPlaying` below)
    // depends on if the audio buffer has been loaded.
    const [shouldPlay, setShouldPlay] = React.useState(false);

    // Creating the audio context here is permitted – the audio context will
    // start off in the suspended state, but we'll resume it later on user
    // interaction (when the user taps the play button).
    //
    // However, creating the audio context here (instead of on first user
    // interaction) causes Chrome to print a spurious warning on the console.
    // *Shrug*
    const audioContextRef = React.useRef(new AudioContext());

    // The audio buffer into which our audio file is loaded into.
    //
    // The AudioNode for playing this back created when the audio buffer is
    // loaded. Subseqently playback is controlled by pausing / resuming the
    // audio context itself. See below for details on why it is this way.
    //
    // Pausing WebAudio nodes
    // ----------------------
    //
    // WebAudio nodes cannot be started / stopped more than once.
    //
    // An alternative is to create a source audio node right at the time of
    // playback, and disconnect (and destroy) it when the user pauses.
    // Subsequent playback will create a new node. However, this method has the
    // issue that the playback position is lost on resume – playback restarts
    // from the beginning.
    //
    // One way around this is to use the playbackRate property (e.g.
    // `playbackRate.value = 0`) to pause, and subsequently resume the node.
    // This is a bona-fide solution, and would suffice too: However, in case we
    // have a more complicated audio routing graph, modifying playback rates
    // individually would get cumbersome.
    //
    // So, we use the other alternative - pausing and resuming the audio context
    // itself. When doing this though, we have to be careful to ensure that the
    // first resume of the audio context happens in response to user
    // interaction, so as to satisfy the browser's autoplay blocking policies.
    //
    // References:
    // - https://github.com/WebAudio/web-audio-api-v2/issues/105
    const [audioBuffer, setAudioBuffer] = React.useState<
        AudioBuffer | undefined
    >();

    // Load the audio file immediately on page load
    React.useEffect(() => {
        // React runs hooks twice during development, so only do the load if it
        // hasn't already happened.
        if (audioBuffer) {
            return;
        }

        createAudioBuffer(audioContextRef.current, "/w1.m4a")
            .then((ab) => {
                setAudioBuffer(ab);
                loopAudioBuffer(audioContextRef.current, ab);
            })
            .catch((e) => {
                console.warn(e);
            });
    }, []);

    const toggleShouldPlay = () => {
        const shouldPlayNew = !shouldPlay;

        // Play / pause is implemented by resuming or suspending the audio
        // context itself. This achieves two ends:
        //
        // 1. The first time around, we need to resume the audio context in
        //    response to user interaction so that the browser's autoplay policy
        //    is satisfied. See
        //    https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
        //
        // 2. Thereafter, resuming / suspending the audio context itself is an
        //    easy way to implement play / pause without keeping around extra
        //    state. See the "Pausing WebAudio nodes" comment above.
        const audioContext = audioContextRef.current;
        if (shouldPlayNew) {
            audioContext.resume();
        } else {
            audioContext.suspend();
        }

        setShouldPlay(shouldPlayNew);
    };

    const isPlaying = shouldPlay && !!audioBuffer;
    const isLoading = shouldPlay && !audioBuffer;

    return (
        <div>
            <Grid>
                <SketchContainer
                    onClick={toggleShouldPlay}
                    isPlaying={isPlaying}
                >
                    <SketchBox />
                </SketchContainer>
                {!isPlaying && (
                    <PlayButtonContainer onClick={toggleShouldPlay}>
                        {isLoading ? <LoadingIndicator /> : <PlayButton />}
                    </PlayButtonContainer>
                )}
            </Grid>
            <Footer />
        </div>
    );
};

const Grid = styled.div`
    display: grid;
    place-items: center;
    min-height: 100svh;
`;

const enableTestRecording = false;

interface SketchContainerProps {
    isPlaying: boolean;
}

const SketchContainer = styled.div<SketchContainerProps>`
    position: relative;

    /* Show an overlay on top of the sketch when the user is not playing */
    &&::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        /* Frosted glass effect */
        backdrop-filter: blur(8px) saturate(100%) contrast(60%) brightness(130%);
        /* Safari wants its own prefix */
        -webkit-backdrop-filter: blur(8px) saturate(100%) contrast(60%)
            brightness(130%);

        display: ${(props) => (props.isPlaying ? "none" : "block")};
    }

    /* Slot both the sketch and the (conditionally displayed) play button in the
       same grid position so that the play button appears on top (with the
       overlay behind it) when playback is stopped. */
    grid-area: 1/-1;
`;

const PlayButtonContainer = styled.div`
    grid-area: 1/-1;

    display: grid;
    z-index: 1;
`;

const SketchBox: React.FC = () => {
    const [recorder, _] = React.useState(new VideoRecorder());

    // Instagram's recommended Reel size is 1080x1920 pixels (9:16 aspect ratio)
    // For @3x devices, that'll translate to 1920/3 = 640 points, and we use
    // that as the height. However, if the window is smaller than that, we limit
    // to the window's height.
    const defaultHeight = 640;
    const aspectRatio = 9 / 16;

    const wrappedSetup = (p5: p5Types, canvasParentRef: Element) => {
        const height = Math.min(defaultHeight, p5.windowHeight);
        const width = height * aspectRatio;

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

const Footer: React.FC = () => {
    const page = ensure(React.useContext(BuildTimePageContext));
    const { title } = page;

    return (
        <FooterContainer>
            <FooterContents>
                <div>
                    <big>
                        <b>{title}</b>
                    </big>
                </div>
                <div>
                    <small>
                        <span className="link-prelude">by </span>
                        <Link to="/">Manav</Link>
                    </small>
                </div>
            </FooterContents>
        </FooterContainer>
    );
};

const FooterContainer = styled.footer`
    display: grid;
    place-items: center;
    min-height: 100svh;
`;

const FooterContents = styled.div`
    text-align: center;

    .link-prelude {
        opacity: 0.7;
    }

    a {
        text-decoration: none;
        opacity: 0.7;
        border-bottom: 1px solid currentColor;
    }

    a:hover {
        opacity: 1;
    }
`;

/**
 * Fetch and decode an audio file into a AudioBuffer
 *
 * @param audioContext The AudioContext` to use for decoding
 * @param URL The (absolute or relative) URL to the audio file. To reduce
 * cross-browser codec compatibility concerns, use MP3 files.
 *
 * [Source - MDN](
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques#dial_up_—_loading_a_sound_sample)
 */
const createAudioBuffer = async (audioContext: AudioContext, url: string) => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    console.log("Audio buffer loaded", url);
    return audioBuffer;
};

/**
 * Create a source node to play an audio buffer in a loop.
 *
 * @param audioContext The AudioContext in which to play.
 * @param audioBuffer The AudioBuffer to play. See `createAudioBuffer` for
 * instance on how to load a file into a buffer.
 *
 * @returns The source AudioNode that will play the buffer. The node will be set
 * to loop, and will also be started. This source can then be subsequently
 * stopped.
 *
 * [Source - MDN](
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques#dial_up_—_loading_a_sound_sample)
 */
const loopAudioBuffer = (
    audioContext: AudioContext,
    audioBuffer: AudioBuffer
) => {
    const bufferSource = new AudioBufferSourceNode(audioContext, {
        buffer: audioBuffer,
    });
    bufferSource.connect(audioContext.destination);
    bufferSource.loop = true;
    bufferSource.start();
    return bufferSource;
};
