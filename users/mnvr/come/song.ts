import {
    cat,
    controls,
    isaw,
    mask,
    Pattern,
    rand,
    saw,
    sine,
    stack,
    timeCat,
} from "@strudel.cycles/core";
import { m } from "strudel/mini";
import type { TidalSong } from "types";

export const song: TidalSong = () => {
    const { note } = controls;

    const d1 = note(
        m`[c d f a]!7 [g!6 f g] [c d f a]!7 [g g g@2 g@2 f g]`
    ).slow(16);

    const d2 = note(m`[c d f a]!7 [g f d c]`)
        .slow(8)
        .sub(note(12));

    const d3 = note(m`[c@2 ~ ~]!7 [g!2 f!2 d@3 c]`)
        .add(note(7))
        .slow(8)
        .s("triangle")
        .decay(0.01)
        .sustain(0.5)
        .release(0.05)
        .cutoff(sine.range(500, 3000).slow(20))
        .resonance(rand.range(13, 16))
        .echo(5, 0.5, 0.1)
        .gain(cat(0, saw.range(0, 1), 1, isaw.range(0, 1)).slow(70))
        .velocity(0.9);

    const d4 = note(m`c2 d2@2 ~`)
        .s("sawtooth")
        .cutoff(saw.range(700, 1200).slow(40))
        .resonance(rand.range(13, 26))
        .velocity(0.7);

    const d4b = d4
        .velocity(0.3)
        .cutoff(saw.range(700, 12000).slow(m`<40@40 5@5>`));

    const ramp4 = (p: Pattern) =>
        p.gain(
            timeCat(
                [1, 0],
                [30, saw.range(0, 0.62)],
                [90, sine.range(0.62, 0.66)],
                [40, isaw.range(0, 0.62)],
                [5, 0]
            ).slow(1 + 30 + 90 + 40 + 5)
        );

    const ramp4b = (p: Pattern) =>
        p.gain(
            timeCat(
                [1 + 30 + 90 + 40 + 5, 0],
                [1, 0],
                [30, saw.range(0, 0.62)],
                [90, sine.range(0.62, 0.66)],
                [40, isaw.range(0, 0.62)],
                [5, 0]
            ).slow((1 + 30 + 90 + 40 + 5) * 2)
        );

    return stack(
        d1,
        d2.echo(1, 0.3, 0.1),
        d2.velocity(0.3).outside(96, mask(m`0!8 1!16 0!24 1!24 0!24`)),
        d3,
        ramp4(d4),
        ramp4b(d4b)
    );
};
