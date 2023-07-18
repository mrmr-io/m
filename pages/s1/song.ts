import { controls, stack } from "@strudel.cycles/core";
import { m } from "strudel/mini";
import type { TidalSong } from "types";

export const song: TidalSong = () => {
    const { note } = controls;

    const p1 = note(m`a4!3`)
        .attack(m`[0.005 0.005 0.005]`)
        .decay(0.02)
        .gain(m`[1 0.4 0.4]`)
        .s("sine")
        .sustain(0);

    const p2 = note(m`[a3 c4 a3 f#3 f3 f#3]/2`)
        .attack(m`[0.01 0.01 0.01]`)
        .decay(0.2)
        .gain(m`[0.6 0.4 0.6]`)
        .s("sawtooth")
        .cutoff(400)
        .sustain(0.1)
        .release(0.5);

    return stack(p1.velocity(0.7), p2.velocity(0.5));
};
