/* =========================
   TOKN SAFE INIT VERSION
========================= */

window.addEventListener("DOMContentLoaded", () => {

    console.log("Tokn JS Loaded ✔");

    /* ELEMENTS */
    const promptInput = document.getElementById("promptInput");

    const charCount = document.getElementById("charCount");
    const wordCount = document.getElementById("wordCount");
    const tokenCount = document.getElementById("tokenCount");

    const tokenContainer = document.getElementById("tokenContainer");
    const jsonOutput = document.getElementById("jsonOutput");

    const contextProgress = document.getElementById("contextProgress");
    const contextUsageText = document.getElementById("contextUsageText");
    const tokenBadge = document.getElementById("tokenBadge");

    const CONTEXT_LIMIT = 128000;

    /* SAFETY CHECK */
    if (!promptInput) {
        console.error("❌ promptInput not found. Check HTML ID.");
        return;
    }

    /* TOKENIZER (simple safe version) */
    function tokenize(text) {
        if (!text) return [];
        return text
            .trim()
            .split(/\s+/)
            .filter(Boolean);
    }

    function update() {
        const text = promptInput.value || "";

        const tokens = tokenize(text);

        /* stats */
        charCount.textContent = text.length;
        wordCount.textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
        tokenCount.textContent = tokens.length;

        tokenBadge.textContent = `${tokens.length} Tokens`;

        /* render tokens */
        tokenContainer.innerHTML = "";

        if (tokens.length === 0) {
            tokenContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🧠</div>
                    <h4>Start typing</h4>
                    <p>Tokens will appear here automatically.</p>
                </div>
            `;
        } else {
            tokens.forEach(t => {
                const span = document.createElement("span");
                span.textContent = t;
                span.className = "token";
                span.style.padding = "6px 10px";
                span.style.margin = "3px";
                span.style.display = "inline-block";
                span.style.borderRadius = "8px";
                span.style.background = "rgba(99,102,241,0.15)";
                span.style.border = "1px solid rgba(99,102,241,0.4)";
                tokenContainer.appendChild(span);
            });
        }

        /* context bar */
        const est = Math.ceil(text.length / 4);
        const percent = Math.min((est / CONTEXT_LIMIT) * 100, 100);

        contextProgress.style.width = percent + "%";
        contextUsageText.textContent = `${est} / ${CONTEXT_LIMIT}`;

        jsonOutput.textContent = JSON.stringify({
            text,
            tokens,
            tokenCount: tokens.length
        }, null, 2);
    }

    /* EVENT */
    promptInput.addEventListener("input", update);

    /* INIT */
    update();
});