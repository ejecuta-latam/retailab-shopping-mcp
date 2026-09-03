import type { FormEvent } from "react";
import { storeSuggestions } from "../../lib/demo/catalog";
import type { AgentLogEntry, StoreId } from "../../lib/demo/types";

interface AgentPanelProps {
  storeId: StoreId;
  storeName: string;
  log: AgentLogEntry[];
  onPrompt: (prompt: string) => void;
}

export default function AgentPanel({
  storeId,
  storeName,
  log,
  onPrompt,
}: AgentPanelProps) {
  const suggestions = storeSuggestions(storeId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const prompt = String(data.get("prompt") ?? "").trim();
    if (!prompt) {
      return;
    }
    onPrompt(prompt);
    form.reset();
  }

  return (
    <section className="agent" aria-labelledby="agent-heading">
      <header className="agent__head">
        <div>
          <h3 id="agent-heading">Agent</h3>
          <p>
            Reading <strong>{storeName}</strong> through the shopping-mcp tools.
            Same profile on every store.
          </p>
        </div>
      </header>

      <div className="agent__log" aria-live="polite">
        {log.length === 0 ? (
          <p className="agent__empty">
            Ask it to add something from this page. Tool calls show up here.
          </p>
        ) : (
          log.map((entry) => (
            <div key={entry.id} className={`agent__row agent__row--${entry.kind}`}>
              {entry.kind === "tool" ? (
                <>
                  <code className="agent__call">
                    {entry.toolName}({JSON.stringify(entry.args)})
                  </code>
                  <span className="agent__result">{entry.result}</span>
                </>
              ) : (
                <p>{entry.result}</p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="agent__chips">
        {suggestions.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="agent__chip"
            onClick={() => onPrompt(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      <form className="agent__form" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="agent-prompt">
          Agent prompt
        </label>
        <input
          id="agent-prompt"
          name="prompt"
          type="text"
          autoComplete="off"
          placeholder={`Shop ${storeName}…`}
        />
        <button type="submit">Run</button>
      </form>
    </section>
  );
}
