import {
    add,
    controls,
    rand,
    saw,
    sine,
    stack,
    timeCat,
    tri,
} from "@strudel.cycles/core";
import { m } from "strudel/mini";
import type { TidalSong } from "types";

export const song: TidalSong = () => {
    const { note } = controls;

    const p1 = note(m`c <a ~ ~ [f e]>`).gain(0.5);
    const p2 = note(m`c <a ~ ~ [f e]>`)
        .add(12)
        .s("triangle")
        .gain(0.3);
    const p3 = stack(p1, p2);

    const c0 = note(m`<[c2*3 d2*3]!2 [c2*3 [d2 | d2*3]] ~>/2`)
        .add(note(12))
        .s("triangle")
        .cutoff(m`1900`)
        .room(m`0.9:10`);

    const c0a = note(m`c5 c5 <~ d3>`)
        .cutoff([tri.range(100, 1800).slow(10)])
        .gain(m`<0@30 1@5>`.squeeze([0, sine.range(0, 0.5).add(0.5).slow(5)]));

    const c1 = note(m`[c5*5 d5*7] <c6 g#6 g6 c7>`)
        .cutoff(m`1500 3000 400 1000 9000`)
        .sustain(m`1.3 0.7 1.6`)
        .delay([0.4, 0.9, 0])
        .gain(0.7);

    const d1 = note(m`c2 d2@2 ~`)
        .s("sawtooth")
        .cutoff(saw.range(700, 1200).slow(40))
        .resonance(rand.range(13, 26))
        .gain(0.62);

    const p4 = stack(c1, d1);
    rand.range(0, 30);

    // debugPrint(m`0@2 1@2`.squeeze([0, 1]), 10);
    // debugPrint(m`<0@3 1>`.squeeze(m`a b`).drawLine(), 4);

    const p6 = m`<0@3 1>`.squeeze(m`a5 b5`).gain(0.8);

    const p5 = stack(c0, c0a);

    const p7 = note(m`a4@3 a4`)
        .s("sine")
        .gain(m`<0.9 0.4@3>`);

    const p7b = note(m`a4`)
        // .s("sine")
        .gain(m`<0.4@3 0.9>`)
        .gain(0.5)
        // .cutoff(1000)
        // .outside(
        //     12,
        //     cutoff(
        //         timeCat(
        //             [1, m`100`],
        //             [2, saw.range(100, 600).slow(2)],
        //             [7, sine.range(600, 900)],
        //             [2, isaw.range(100, 600).slow(2)]
        //         )
        //     )
        // )
        .outside(
            30,
            add(
                timeCat(
                    [12, note(0)],
                    [1, note(1)],
                    [1, note(0)],
                    [3, note(3)],
                    [1, note(7)],
                    [12, note(0)]
                )
            )
        )
        // .outside(
        //     30,
        //     gain(
        //         timeCat(
        //             [12, 0.0],
        //             [1, 0.7],
        //             [1, 0.7],
        //             [3, 0.7],
        //             [1, 0.7],
        //             [12, 0.0]
        //         )
        //     )
        // )
        // .outside(12, mask(m`0!4 1!6 1 1`))
        .inspect();

    // const p7c = time.segment(1).inspect();
    // console.log(Fraction("3/4"));

    const p8 = note(m`[c5 d5] <c6 g#6 g6 c7>`)
        .fast(121)
        .gain(timeCat([1, 0], [20, saw.range(0.05, 0.3)], [100, 0.3]))
        .slow(121);

    return stack(p7, p7b, p8.hush());
};
