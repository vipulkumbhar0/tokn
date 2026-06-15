/* =========================
   TOKN v2 - Smart Token Visualizer
   (Pseudo BPE-style simulation)
========================= */

/* Elements */
const promptInput = document.getElementById("promptInput");

const charCount = document.getElementById("charCount");
const wordCount = document.getElementById("wordCount");
const tokenCount = document.getElementById("tokenCount");

const tokenContainer = document.getElementById("tokenContainer");
const jsonOutput = document.getElementById("jsonOutput");

const contextProgress = document.getElementById("contextProgress");
const contextUsageText = document.getElementById("contextUsageText");
const tokenBadge = document.getElementById("tokenBadge");

/* Config */
const CONTEXT_LIMIT = 128000;

/* =========================
   SMART TOKENIZER (Pseudo BPE)
========================= */

/*
   This is NOT real tiktoken,
   but simulates subword behavior:

   - splits punctuation
   - splits camelCase
   - splits long words into chunks
   - keeps common words intact
*/

function smartTokenize(text) {
    if (!text) return [];

    let raw = text
        .replace(/\n/g, " \n ")
        .replace(/([.,!?;:()])/g, " $1 ")
        .split(/\s+/)
        .filter(Boolean);

    let tokens = [];

    raw.forEach(word => {
        // keep punctuation as separate tokens
        if (/^[.,!?;:()]+$/.test(word)) {
            tokens.push(word);
            return;
        }

        // detect camelCase → split
        let camelSplit = word.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ");

        camelSplit.forEach(part => {
            if (!part) return;

            // long word simulation (BPE-like chunking)
            if (part.length > 12) {
                for (let i = 0; i < part.length; i += 4) {
                    tokens.push(part.slice(i, i + 4));
                }
            } else if (part.length > 8) {
                for (let i = 0; i < part.length; i += 3) {
                    tokens.push(part.slice(i, i + 3));
                }
            } else {
                tokens.push(part);
            }
        });
    });

    return tokens;
}

/* =========================
   COUNTERS
========================= */

function getWordCount(text) {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
}

function estimateTokens(text) {
    return Math.ceil(text.length / 3.8);
}

/* =========================
   ANIMATED RENDER
========================= */

function renderTokensAnimated(tokens) {
    tokenContainer.innerHTML = "";

    if (!tokens.length) {
        tokenContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🧠</div>
                <h4>Start typing</h4>
                <p>Tokens will appear here automatically.</p>
            </div>
        `;
        return;
    }

    tokens.forEach((token, i) => {
        setTimeout(() => {
            const el = document.createElement("span");

            el.textContent = token;

            el.style.padding = "6px 10px";
            el.style.borderRadius = "8px";
            el.style.fontSize = "13px";
            el.style.margin = "2px";
            el.style.display = "inline-block";

            // gradient based token style
            el.style.background = "rgba(99,102,241,0.15)";
            el.style.border = "1px solid rgba(99,102,241,0.4)";
            el.style.color = "#c7d2fe";

            el.style.opacity = "0";
            el.style.transform = "translateY(6px)";
            el.style.transition = "0.2s ease";

            tokenContainer.appendChild(el);

            requestAnimationFrame(() => {
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
            });

        }, i * 15); // streaming effect
    });
}

/* =========================
   JSON OUTPUT
========================= */

function updateJSON(tokens, text) {
    const payload = {
        model: "tokn-v2-simulated-bpe",
        input: text,
        characters: text.length,
        words: getWordCount(text),
        tokens: tokens,
        tokenCount: tokens.length,
        estimatedTokens: estimateTokens(text),
        compressionRatio: (tokens.length / Math.max(1, text.length)).toFixed(3)
    };

    jsonOutput.textContent = JSON.stringify(payload, null, 2);
}

/* =========================
   STATS + CONTEXT
========================= */

function updateStats(text, tokens) {
    const chars = text.length;
    const words = getWordCount(text);
    const tCount = tokens.length;

    charCount.textContent = chars;
    wordCount.textContent = words;
    tokenCount.textContent = tCount;
    tokenBadge.textContent = `${tCount} Tokens`;

    const est = estimateTokens(text);
    const percent = Math.min((est / CONTEXT_LIMIT) * 100, 100);

    contextProgress.style.width = percent + "%";
    contextUsageText.textContent = `${est} / ${CONTEXT_LIMIT}`;
}

/* =========================
   MAIN ENGINE
========================= */

function updateAll() {
    const text = promptInput.value;

    const tokens = smartTokenize(text);

    updateStats(text, tokens);
    renderTokensAnimated(tokens);
    updateJSON(tokens, text);
}

/* =========================
   LIVE LISTENER
========================= */

let debounceTimer;

promptInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updateAll, 80);
});

/* INIT */
updateAll();