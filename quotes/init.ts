import { parseQuotes, type ParsedQuote } from "../pages/quotes/parse";
import { quotes } from "../pages/quotes/quotes";
import { ensure, ensureNumber } from "../src/utils/ensure";
import { randomInt, randomItem } from "../src/utils/random";

export const parsedQuotes = parseQuotes(quotes);
console.log({ parsedQuotes });

/**
 * The index of the quote that we are currently showing. It indexes into
 * {@link quotes} property of {@link parsedQuotes}.
 *
 * This will be undefined initially, when we haven't yet shown the initial
 * quote. The initial quote is randomly selected on page load.
 */
let _quoteIndex: number | undefined;

const init = () => {
    console.log("init");
    window.addEventListener("popstate", handlePopState);
    loadInitialQuote();
};

const handlePopState = (event: PopStateEvent) => {
    const { state } = event;
    console.log("handlePopState", state, event);

    // When the user presses back from this page itself the
    // `removeEventListener` below runs after the page is destroyed. But
    // before that can happen, we end up here because of a spurious (not
    // meant for us) "popstate".
    //
    // Such a spurious event might not have any state, or might not have
    // state of the form that we expect. So only proceed if we recognize the
    // shape of the state.
    if (!state) return;
    if (typeof state.quoteIndex !== "number") return;

    showQuoteAtIndex(ensureNumber(state.quoteIndex));
};

const loadInitialQuote = () => {
    const quoteIndex = randomInt(parsedQuotes.quotes.length);
    // Modify the current history entry to keep track of the quote that
    // we are initially showing. This is needed for the back to the
    // first quote to work.
    window.history.replaceState({ quoteIndex }, "");
    showQuoteAtIndex(quoteIndex);
};

const showQuoteAtIndex = (i: number) => {
    _quoteIndex = i;
    const quote = parsedQuotes.quotes[i];
    console.log("showQuoteAtIndex", { i, quote });
    const output = document.getElementsByTagName("output")[0];
    output.replaceChildren(createDOMElement(quote));
};

/**
 * Follow the hyperlink from the given word (in the current quote) to some other
 * (randomly selected) quote. Update the display by using
 * {@link showQuoteAtIndex} to update the current quote.
 */
export const traverse = (word: string) => {
    const { quoteIndicesForWord } = parsedQuotes;
    const key = word.toLowerCase();
    const linkedQuoteIndices = ensure(quoteIndicesForWord.get(key)).filter(
        (qi) => qi !== _quoteIndex,
    );

    const quoteIndex = ensure(randomItem(linkedQuoteIndices));
    window.history.pushState({ quoteIndex }, "");
    showQuoteAtIndex(quoteIndex);
};

const createDOMElement = (quote: ParsedQuote) => {
    const p = document.createElement("p");
    for (const segment of quote) {
        if (Array.isArray(segment)) {
            // A hyperlinked word.
            const word = ensure(segment[0]);
            const a = document.createElement("a");
            a.href = "#";
            a.addEventListener("click", () => traverse(word));
            a.textContent = word;
            p.appendChild(a);
        } else {
            const word = segment;
            const span = document.createElement("span");
            span.textContent = word;
            p.appendChild(span);
        }
    }
    return p;
};

init();
