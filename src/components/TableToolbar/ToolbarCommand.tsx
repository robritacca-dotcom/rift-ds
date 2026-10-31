'use client';

/**
 * TableToolbar's AI command: the button in the bar, the mini composer it
 * opens, and the toast that reports the result. Internal: the public surface is
 * TableToolbar's `command` prop. It applies what comes back through the table's
 * own applyView, so the command can do exactly what the bar's other controls
 * can, and nothing else; the handler it calls owns the model.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AiButton } from '../AiButton/AiButton';
import { Button } from '../Button/Button';
import { Composer } from '../Composer/Composer';
import { Popover } from '../Popover/Popover';
import { PromptSuggestions } from '../PromptSuggestions/PromptSuggestions';
import { Toast } from '../Toast/Toast';
import type { TableContextValue } from '../DataTable/tableContext';
import type { TableView } from '../DataTable/views';
import type { TableToolbarCommand, TableToolbarLabels } from './TableToolbar';

type Outcome = {
  message: string;
  failed: boolean;
  /** The setup to return to, when the command changed it. */
  before?: TableView;
};

export function useToolbarCommand(
  command: TableToolbarCommand | undefined,
  table: TableContextValue | null,
  labels: TableToolbarLabels,
) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [running, setRunning] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);

  // The popover's panel stays mounted while shut, so a mount-time autofocus never lands.
  useEffect(() => {
    if (open) panel.current?.querySelector('textarea')?.focus();
  }, [open]);

  const run = useCallback(
    async (typed: string) => {
      const trimmed = typed.trim();
      if (!trimmed || !command || !table || running) return;
      const before = JSON.parse(JSON.stringify(table.view)) as TableView;
      setOpen(false);
      setText('');
      setRunning(true);
      setOutcome(null);
      try {
        const result = await command.onSubmit({
          text: trimmed,
          view: before,
          columns: table.columns,
          signal: new AbortController().signal,
        });
        if (result.view) table.applyView(result.view);
        setOutcome({ message: result.message ?? '', failed: false, before: result.view ? before : undefined });
      } catch (error) {
        // What was asked goes back in the composer, so a failed command is one click from another try.
        setText(trimmed);
        setOutcome({
          message: error instanceof Error && error.message ? error.message : labels.commandFailed,
          failed: true,
        });
      } finally {
        setRunning(false);
      }
    },
    [command, table, running, labels.commandFailed],
  );

  const control = (size: 'default' | 'compact', iconOnly: boolean) =>
    command && table ? (
      <Popover
        size={size}
        position="bottom"
        align="end"
        ariaLabel={labels.command}
        open={open}
        onOpenChange={setOpen}
        className="ds-table-toolbar__command"
        content={
          <div className="ds-table-toolbar__command-panel" ref={panel}>
            <Composer
              size="compact"
              value={text}
              onValueChange={setText}
              onSubmit={run}
              placeholder={labels.commandPlaceholder}
              sendLabel={labels.commandSend}
              attachButton={false}
              maxRows={1}
            />
            {!text && command.suggestions && command.suggestions.length > 0 && (
              <PromptSuggestions
                suggestions={command.suggestions.map((label) => ({ id: label, label }))}
                layout="wrap"
                onValueChange={(id) => void run(id)}
              />
            )}
          </div>
        }
      >
        <AiButton
          iconOnly={iconOnly}
          size={size}
          label={labels.command}
          state={running ? 'working' : outcome?.failed ? 'error' : outcome ? 'done' : 'idle'}
        />
      </Popover>
    ) : null;

  const toast = outcome
    ? createPortal(
        <div className="ds-table-toolbar__command-toast">
          <Toast
            variant={outcome.failed ? 'error' : 'positive'}
            description={outcome.message}
            dismissLabel={labels.commandDismiss}
            onDismiss={() => setOutcome(null)}
            action={
              outcome.before ? (
                <Button
                  variant="secondary"
                  tone="neutral"
                  size="compact"
                  iconLeft="refresh"
                  label={labels.commandUndo}
                  onClick={() => {
                    table?.applyView(outcome.before!);
                    setOutcome(null);
                  }}
                />
              ) : undefined
            }
          />
        </div>,
        document.body,
      )
    : null;

  return { control, toast };
}
