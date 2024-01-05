import { ensure } from "utils/ensure";
import { type CellCoordinate, type GridSize } from "./grid";

/**
 * A {@link Glyph} is a multiline dot-matrix rendition of a character or symbol
 * that we want to display on the grid.
 *
 * Its string representation of it has a line per row, and a character per
 * column. The period / dot ('.') character is blank space, and everything else
 * causes the cell to be filled.
 */
export type GlyphString = string;

export const glyphStringB = `
.●●●..
.●..●.
.●●●..
.●..●.
.●●●..
`;

/** A parsed representation of a {@link GlyphString} for fast indexing */
export interface Glyph {
    /**
     * The size of the grid (i.e. the number of rows and columns) spanned by the
     * {@link GlyphString} at its original scale (1).
     */
    size: GridSize;
    /**
     * The {@link GlyphString} itself, but split into lines for faster indexing.
     */
    lines: string[];
}

/** Parse a {@link GlyphString} into an easier to use representation */
export const parseGlyph = (glyphString: GlyphString): Glyph => {
    const lines = glyphString.split("\n").filter((s) => !!s);

    const size = {
        rowCount: lines.length,
        colCount: ensure(lines[0]).length,
    };

    return { lines, size };
};

/**
 * Combine two {@link Glyph}s into a single {@link Glyph}.
 *
 * The glyphs being combined should have the same height (i.e same number of
 * rows). This function will return throw an error if that is not the case.
 *
 * @returns a new {@link Glyph} that is the concatenation of the provided
 * glyphs.
 */
export const combineGlyphs = (g1: Glyph, g2: Glyph): Glyph => {
    if (g1.size.rowCount === g2.size.rowCount) {
        const gs = JSON.stringify([g1, g2]);
        throw new Error(
            `Attempting to combine two glyphs that do not have the same height. The glyphs were ${gs}`,
        );
    }
    return g1;
};

/** Return true if the matrix position at the given glyph coordinate is lit */
export const isGlyphCoordinateLit = (
    { lines }: Glyph,
    { row, col }: CellCoordinate,
) => lines[row]![col] !== ".";
