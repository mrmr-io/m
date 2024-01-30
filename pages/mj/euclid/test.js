/**
 * A JavaScript CLI program to generate Euclidean Rhythms
 *
 * This is meant as a test bed for our algorithm. It is in JavaScript so that it
 * can directly be invoked without needing transpilation:
 *
 *     node pages/mj/euclid/test.js
 *
 * It will then generate some Euclidean Rhythms, and compare them against the
 * examples given in Toussaint's paper, _The Euclidean Algorithm Generates
 * Traditional Musical Rhythms_.
 */

/**
 * Euclidean rhythm E(k, n) where k is the number of 1's and n is the length of
 * the sequence.
 */
const E = (k, n) => {
    const seq = Array(n)
        .fill(0)
        .map((_, i) => (i < k ? [1] : [0]));

    // const fold = (n, k, seq) => {
    //     if (k <= 2) return seq;
    //     const sm = Math.min(k, seq.length - k);
    //     const leading = seq.slice(0, seq.length - sm);
    //     const trailing = seq.slice(-1 * sm);
    //     const llen = leading.length;
    //     const tlen = trailing.length;

    //     let result = [];
    //     for (let i = 0; i < Math.max(llen, tlen); i++) {
    //         let r = [];
    //         if (i < llen) {
    //             r.push(...leading[i]);
    //         }
    //         if (i < tlen) {
    //             r.push(...trailing[i]);
    //         }
    //         result.push(r);
    //     }

    //     // console.log({ n, k, seq, leading, trailing, result });

    //     return fold(k, n % k, result);
    // };

    const debug = true;

    // const fold = (n, k, z, seq) => {
    //     if (k < 2) return seq;

    //     let result = [...seq];
    //     if (debug) console.log({ n, k, z, result });

    //     // If k divides into n, fold the sequence symmetrically
    //     if (n % k === 0) {
    //         for (let i = 0; i < k; i++) {
    //             for (let j = i + k; j < n; j += k) {
    //                 result[i] = [...result[i], ...result[j]];
    //             }
    //         }
    //         result = result.slice(0, k);
    //     } else if (z > 0) {
    //         // limit the fold to z (number of remaining zeros)
    //         let i = 0;
    //         for (; i < Math.min(k, z); i++) {
    //             result[i] = [...result[i], ...result[result.length - i - 1]];
    //             if (debug) console.log({ i, k, result });
    //         }
    //         result = result.slice(0, -i);
    //     } else {
    //         for (let i = 0; i < k; i++) {
    //             result[i] = [...result[i], ...result[result.length - i - 1]];
    //             if (debug) console.log({ i, k, result });
    //         }
    //         result = result.slice(0, -k);
    //     }

    //     if (debug) console.log("after slicing", result);
    //     return fold(k, n % k, 0, result);
    // };

    // An implementation of Bjorklund's algorithm for calculating the Euclidean
    // rhythms, as described in the 2005 (extended) paper _The Euclidean
    // Algorithm Generates Traditional Musical Rhythms_ by Godfried Toussaint.
    const fold = (n, k, z, seq) => {
        let result = [...seq];

        // Remainder
        let rem = n;

        // > If there is more than one zero the algorithm moves zeros in stages.
        //   We begin by taking zeroes one-at-a-time (from right to left),
        //   placing a zero after each one (from left to right).
        let nz = z;
        while (nz > 0) {
            // Number of zeros to move in this stage is the minimum of the
            // remaining zeros and the remainder (k).
            const toMove = Math.min(nz, k);
            for (let i = 0; i < toMove; i++) {
                result[i] = [...result[i], ...result[result.length - 1 - i]];
            }
            result = result.slice(0, result.length - toMove);
            nz = nz - toMove;
            rem = rem - toMove;
            if (debug) console.log(`stage: after moving ${toMove} zeroes`, {nz, rem, result});
        }

        return result;
    };

    return fold(n, k, n - k, seq).flat();
};

const test = (k, n, expected) => {
    const seq = JSON.stringify(E(k, n));
    const exp = JSON.stringify(expected);
    console.log(`E(${k},${n})\t${seq}`);
    if (seq != exp) {
        console.log(`Expectd\t${exp}`);
        console.assert(seq == exp, `Expected E(${k}, ${n}) to match ${exp}`);
        process.exit(1);
    }
};

// Expected: [1,0,1,1,0,1,1,0,1,1]
// Out     : [1,0,1,0,1,0,1,1,1,1]
// test(7, 10, [1, 0, 1, 1, 0, 1, 1, 0, 1, 1]);

// ---

// Regular / periodic / "isochronous" rhythms
//
// The paper calls them out separately; our algorithm too has a special case for
// dealing with them.
// test(4, 16, [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]);
// test(3, 12, [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]);

// // The three main examples from the paper illustrating the algorithm
test(5, 13, [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0]);
// test(3, 8, [1, 0, 0, 1, 0, 0, 1, 0]);
// test(5, 8, [1, 0, 1, 1, 0, 1, 1, 0]);

// // The paper lists [1, 0, 1], we get a rotated version
// test(2, 3, [1, 1, 0]);
// test(1, 2, [1, 0]);
// test(1, 3, [1, 0, 0]);
// test(2, 5, [1, 0, 1, 0, 0]);
// // The paper lists [1, 0, 1, 1], we get a rotated version
// test(3, 4, [1, 1, 1, 0]);
// test(3, 5, [1, 0, 1, 0, 1]);
// test(3, 7, [1, 0, 1, 0, 1, 0, 0]);
// test(4, 7, [1, 0, 1, 0, 1, 0, 1]);
// test(4, 9, [1, 0, 1, 0, 1, 0, 1, 0, 0]);

// test(
//     13,
//     24,
//     [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
// );
