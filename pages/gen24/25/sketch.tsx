import { ensure } from "utils/ensure";
import type { CellShader, GridShader } from "../grid";
import { cellIndex, gridSketch } from "../grid";

/**
 * Sketch Description
 * ------------------
 *
 * The tablecloth has chains of white bulbous circles running down its length.
 *
 * The bulb can be, in its most abstract form, thought of as a diamond running
 * along the length of each cell. The actual sketch uses Bézier curves for
 * smooth gradients.
 *
 * For each cell, we pick two randomly generated points. These are two slight
 * offsets of the top of each bulb. These are store as part of the state so that
 * the cell preceding this cell can end its diamond at the exact same point.
 * This way all the bulbs look like they're chained together on the same
 * "string".
 */
interface State {
    /**
     * A map of the four horizontal offsets for the top anchors for each cell,
     * indexed by the cell's index.
     */
    topAnchorOffsets: Record<number, [left: number, right: number]>;
}

const drawGrid: GridShader<State> = ({ p5, grid, cs }) => {
    /* Finlayson, est 1820 */
    p5.randomSeed(1820);

    const makeState = () => {
        const topAnchorOffsets: Record<number, [number, number]> = {};

        /** A few pixels is enough */
        const maxOffset = p5.max(4, cs / 16);
        const offset = () => Math.floor(p5.random() * maxOffset);

        for (let row = 0; row < grid.rowCount; row++) {
            for (let col = 0; col < grid.colCount; col++) {
                const ci = cellIndex({ row, col }, grid);
                const left = offset();
                const right = offset();
                topAnchorOffsets[ci] = [left, right];
            }
        }

        return { topAnchorOffsets };
    };

    p5.clear();
    p5.strokeWeight(0);
    p5.background(220, 60, 70);
    p5.fill("white");

    /* noLoop is true, we only run once */
    return makeState();
};

/**
 * An unused, simple implementation that demonstrates the basic gist of what
 * we're trying to do
 */
const drawCell0: CellShader<State> = ({ p5, x, y, s }) => {
    p5.beginShape();
    p5.vertex(x + s / 2, y);
    p5.bezierVertex(x, y + s / 2, x, y + s / 2, x + s / 2, y + s);
    p5.bezierVertex(x + s, y + s / 2, x + s, y + s / 2, x + s / 2, y);
    p5.endShape();
};

/** A convenience alias for two x and y pixel coordinates that define a point */
type Pt = [x: number, y: number];

const debug = false;

const drawCell: CellShader<State> = ({ p5, x, y, s, cell, grid, state }) => {
    // Draw four bezier curves, roughly approximating a diamond horizontally
    // centered in the cell and running along its entire height. The anchor
    // points (a*) and the control points (c*) below are chosen so as to give a
    // bit of a bulge to the "bulby" shape that we draw.

    const { topAnchorOffsets } = ensure(state);
    const [otLeft, otRight] = ensure(topAnchorOffsets[cell.index]);
    const [obLeft, obRight] = topAnchorOffsets[
        cellIndex({ row: cell.row + 1, col: cell.col }, grid)
    ] ?? [0, 0]; /* last row won't have a successor cell, so use 0, 0 */

    // Top anchor point 1
    const a1: Pt = [x + s / 2 - otLeft, y];
    // Control points
    const c1: Pt = [x + s / 2, y + s / 2 - s / 4];
    const c2: Pt = [x + s / 8, y + s / 8];

    // Left anchor point
    const a2: Pt = [x + s / 8, y + s / 2];

    // Almost mirror of c2
    const c3: Pt = [x + s / 8, y + s - s / 8];
    // Similar to c1
    const c4: Pt = [x + s / 2, y + s - s / 4];

    // Bottom anchor point 1
    const a3: Pt = [x + s / 2 - obLeft, y + s];

    // Now let's draw the other side.

    // Bottom anchor point 2
    const a4: Pt = [x + s / 2 + obRight, y + s];

    // Control points, following a similar pattern as the left side.
    // Inexact mirror of c4
    const c5: Pt = [x + s / 2, y + s - s / 4];
    // Inexact mirror of c3
    const c6: Pt = [x + s - s / 8, y + s - s / 8];

    // Right anchor point, an inexact mirror of the left one.
    const a5: Pt = [x + s - s / 8, y + s / 2];

    // Almost mirror of c6
    const c7: Pt = [x + s - s / 8, y + s / 8];
    // Inexact mirror of c1
    const c8: Pt = [x + s / 2, y + s / 2 - s / 4];

    // Top anchor point 2
    const a6: Pt = [x + s / 2 + otRight, y];

    const ja1 = a1;
    const ja2 = jiggle(a2);
    const ja3 = a3;
    const ja4 = a4;
    const ja5 = jiggle(a5);
    const ja6 = a6;

    const jc1 = jiggle(c1);
    const jc2 = jiggle(c2);
    const jc3 = jiggle(c3);
    const jc4 = jiggle(c4);
    const jc5 = jiggle(c5);
    const jc6 = jiggle(c6);
    const jc7 = jiggle(c7);
    const jc8 = jiggle(c8);

    p5.beginShape();
    p5.vertex(...ja1);
    p5.bezierVertex(...jc1, ...jc2, ...ja2);
    p5.bezierVertex(...jc3, ...jc4, ...ja3);
    p5.vertex(...ja4);
    p5.bezierVertex(...jc5, ...jc6, ...ja5);
    p5.bezierVertex(...jc7, ...jc8, ...ja6);
    p5.endShape(p5.CLOSE);

    if (!debug) return;

    p5.push();
    p5.fill("cyan");
    p5.circle(...c1, 5);
    p5.circle(...c2, 5);
    p5.circle(...c3, 5);
    p5.circle(...c4, 5);
    p5.circle(...c5, 5);
    p5.circle(...c6, 5);
    p5.circle(...c7, 5);
    p5.circle(...c8, 5);

    p5.fill("pink");
    p5.circle(...jc1, 5);
    p5.circle(...jc2, 5);
    p5.circle(...jc3, 5);
    p5.circle(...jc4, 5);
    p5.circle(...jc5, 5);
    p5.circle(...jc6, 5);
    p5.circle(...jc7, 5);
    p5.circle(...jc8, 5);

    p5.fill("green");
    p5.circle(...a1, 5);
    p5.circle(...a2, 5);
    p5.circle(...a3, 5);
    p5.circle(...a4, 5);
    p5.circle(...a5, 5);
    p5.circle(...a6, 5);

    p5.fill("pink");
    p5.circle(...ja1, 5);
    p5.circle(...ja2, 5);
    p5.circle(...ja3, 5);
    p5.circle(...ja4, 5);
    p5.circle(...ja5, 5);
    p5.circle(...ja6, 5);

    p5.pop();
};

/**
 * Return a new point that is the result of introducing a random jitter to the
 * given point.
 */
const jiggle = (pt: Pt): Pt => {
    const jx = Math.floor(Math.random() * 8);
    const jy = Math.floor(Math.random() * 8);
    return [pt[0] + jx, pt[1] + jy];
};

export const sketch = gridSketch({
    drawGrid,
    drawCell,
    noLoop: true,
    // n: 2,
    showGuides: debug,
});
