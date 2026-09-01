// Grinrex IoT — demo Garden tasks & notes. The assistant layer: readings become due work,
// confirmed camera findings become treatment tasks, and the gardener writes back.
import { Check, ClipboardList, Droplets, Flower2, ListChecks, NotebookPen, Scissors, Search, Sprout, Timer } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { DemoLayout } from "./DemoLayout";
import { useGarden } from "./GardenContext";
import { demoLink } from "./sections";
import { formatSimClock, simDay, type TaskKind } from "./simulation";

const kindIcon: Record<TaskKind, typeof Sprout> = {
  care: Droplets,
  check: Search,
  harvest: Flower2,
  prune: Scissors,
  note: NotebookPen,
};

const kindLabel: Record<TaskKind, string> = {
  care: "Care",
  check: "Inspect",
  harvest: "Harvest",
  prune: "Prune",
  note: "Note",
};

export default function TasksPage() {
  useDemoMeta("/tasks");
  const { state, actions } = useGarden();
  const [draftTask, setDraftTask] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [showDone, setShowDone] = useState(true);

  const open = state.tasks.filter(task => !task.done);
  const dueNow = open.filter(task => task.dueSimMin <= state.simMin);
  const upcoming = open.filter(task => task.dueSimMin > state.simMin);
  const done = state.tasks.filter(task => task.done);
  const engineMade = open.filter(task => task.auto).length;

  const digest = useMemo(() => {
    const dayStart = Math.floor(state.simMin / 1440) * 1440;
    const sinceToday = state.log.filter(entry => entry.simMin >= dayStart);
    return {
      cycles: sinceToday.filter(entry => entry.source === "Irrigation").length,
      warnings: sinceToday.filter(entry => entry.kind === "warn" || entry.kind === "critical").length,
      litres: state.waterToday,
    };
  }, [state.log, state.simMin, state.waterToday]);

  const addTask = () => {
    if (!draftTask.trim()) return;
    actions.addTask(draftTask, "care");
    setDraftTask("");
  };

  const renderTask = (task: (typeof state.tasks)[number]) => {
    const Icon = kindIcon[task.kind];
    const zone = task.zoneId ? state.zones.find(z => z.id === task.zoneId) : undefined;
    const overdue = !task.done && task.dueSimMin <= state.simMin;
    return (
      <li key={task.id} className={`alert-item rounded-xl p-3.5 ${task.done ? "bg-white/[.02] opacity-60" : "bg-white/[.035]"}`} data-kind={overdue ? "warn" : task.done ? "ok" : "info"}>
        <div className="flex items-start gap-3">
          <button
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${task.done ? "border-[#b8f15a]/60 bg-[#b8f15a]/18 text-[#b8f15a]" : "border-white/25 text-transparent hover:border-[#b8f15a]/60 hover:text-[#b8f15a]/50"}`}
            onClick={() => actions.completeTask(task.id)}
            aria-label={`${task.done ? "Reopen" : "Complete"}: ${task.title}`}
            aria-pressed={task.done}
          >
            <Check size={14} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-sm font-bold ${task.done ? "text-[#8fae93] line-through" : "text-[#effadf]"}`}>{task.title}</span>
              <span className="interface inline-flex items-center gap-1 rounded-full bg-white/[.06] px-2 py-0.5 text-[.52rem] font-extrabold uppercase tracking-[.12em] text-[#9dbd9f]">
                <Icon size={10} /> {kindLabel[task.kind]}
              </span>
              {task.auto && <span className="interface rounded-full border border-[#b8f15a]/35 bg-[#b8f15a]/10 px-2 py-0.5 text-[.52rem] font-extrabold uppercase tracking-[.12em] text-[#b8f15a]">from the engine</span>}
            </div>
            <p className="mt-1.5 text-xs leading-5 text-[#a9c1a2]">{task.detail}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className={`interface text-[.56rem] font-extrabold uppercase tracking-[.1em] ${overdue ? "text-[#ffd49c]" : "text-[#8fae93]"}`}>
                <Timer size={10} className="mr-1 inline" />
                {task.done ? "completed" : overdue ? `overdue since ${formatSimClock(task.dueSimMin, state.settings.clock24h)}` : `due ${formatSimClock(task.dueSimMin, state.settings.clock24h)} · day ${simDay(task.dueSimMin)}`}
              </span>
              {zone && (
                <span className="interface flex items-center gap-1 text-[.56rem] font-extrabold uppercase tracking-[.1em] text-[#7e9a80]">
                  <Sprout size={10} /> {zone.name}
                </span>
              )}
              {!task.done && (
                <button className="demo-chip" onClick={() => actions.snoozeTask(task.id, 120)} aria-label={`Push ${task.title} two hours`}>
                  <Timer size={11} /> +2 h
                </button>
              )}
            </div>
          </div>
        </div>
      </li>
    );
  };

  return (
    <DemoLayout>
      <div className="flex flex-col gap-8">
        <DemoPageHeader
          path="/tasks"
          title="What the garden"
          accent="asks you to do."
          copy="Readings alone are not care. The assistant converts a low tank, a critically dry bed, or a confirmed camera signature into one short line of work with a due time — and keeps the human tasks the model could never infer."
          aside={
            <>
              <StatTile label="Due now" value={dueNow.length} sub={`${open.length} open`} tone={dueNow.length ? "text-[#ffd49c]" : "text-[#b8f15a]"} icon={<ListChecks size={15} className="text-[#d9a35c]" />} />
              <StatTile label="From the engine" value={engineMade} sub="generated this session" icon={<ClipboardList size={15} className="text-[#b8f15a]" />} />
              <StatTile label="Completed" value={done.length} sub="checked off" tone="text-[#8fd3b4]" icon={<Check size={15} className="text-[#8fd3b4]" />} />
            </>
          }
        />

        <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          {/* task list */}
          <div className="demo-panel p-5">
            <DemoSectionTitle
              title="Today's list"
              note={`day ${simDay(state.simMin)} · ${formatSimClock(state.simMin, state.settings.clock24h)}`}
              action={
                <button className="demo-chip" data-on={showDone} onClick={() => setShowDone(value => !value)} aria-label="Toggle completed tasks">
                  {showDone ? "Hide done" : "Show done"}
                </button>
              }
            />

            <div className="mb-4 flex gap-2">
              <input
                value={draftTask}
                onChange={event => setDraftTask(event.target.value)}
                onKeyDown={event => {
                  if (event.key === "Enter") addTask();
                }}
                placeholder="Add a task — “move the seedlings under the shade cloth”"
                className="demo-field flex-1"
                aria-label="New task title"
              />
              <button className="demo-chip !border-[#b8f15a]/45 !text-[#b8f15a]" onClick={addTask} aria-label="Add task">
                Add
              </button>
            </div>

            {dueNow.length > 0 && (
              <div className="mb-4">
                <div className="interface mb-2 text-[.56rem] font-extrabold uppercase tracking-[.14em] text-[#ffd49c]">Due now ({dueNow.length})</div>
                <ul className="space-y-2.5">{dueNow.map(renderTask)}</ul>
              </div>
            )}
            <div className="interface mb-2 text-[.56rem] font-extrabold uppercase tracking-[.14em] text-[#8fae93]">Upcoming ({upcoming.length})</div>
            {upcoming.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/12 p-4 text-sm text-[#8fae93]">Nothing queued. Add a task above, or let the engine find one — it watches the tank, dry zones, lockouts, and camera reviews.</p>
            ) : (
              <ul className="space-y-2.5">{upcoming.map(renderTask)}</ul>
            )}
            {showDone && done.length > 0 && (
              <>
                <div className="interface mb-2 mt-4 text-[.56rem] font-extrabold uppercase tracking-[.14em] text-[#7e9a80]">Completed ({done.length})</div>
                <ul className="space-y-2.5">{done.map(renderTask)}</ul>
              </>
            )}
          </div>

          {/* notes + digest */}
          <div className="flex flex-col gap-4">
            <div className="demo-panel p-5">
              <DemoSectionTitle title="Garden notes" note={`${state.notes.length} entries`} />
              <textarea
                value={draftNote}
                onChange={event => setDraftNote(event.target.value)}
                rows={3}
                placeholder="What did you see today? Flowering, damage, a smell, a suspect leaf…"
                className="demo-field w-full resize-none"
                aria-label="New garden note"
              />
              <div className="mt-2.5 flex items-center justify-between">
                <span className="interface text-[.54rem] font-extrabold uppercase tracking-[.12em] text-[#7e9a80]">Notes stay with the record, not the alert feed</span>
                <button
                  className="demo-chip !border-[#b8f15a]/45 !text-[#b8f15a]"
                  onClick={() => {
                    if (!draftNote.trim()) return;
                    actions.addNote(draftNote);
                    setDraftNote("");
                  }}
                  aria-label="Save note"
                >
                  <NotebookPen size={12} /> Record
                </button>
              </div>
              <ul className="demo-scroll mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
                {state.notes.map(note => (
                  <li key={note.id} className="rounded-xl bg-white/[.035] p-3">
                    <div className="interface text-[.54rem] font-extrabold uppercase tracking-[.12em] text-[#d9a35c]">
                      day {simDay(note.simMin)} · {formatSimClock(note.simMin, state.settings.clock24h)}
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-[#c9dcbf]">{note.text}</p>
                  </li>
                ))}
              </ul>
            </div>

            {state.settings.dailyDigest ? (
              <div className="demo-panel p-5">
                <DemoSectionTitle title="Daily digest" note="the one message a day" />
                <ul className="space-y-2 text-sm text-[#afc5a7]">
                  <li className="flex items-center justify-between rounded-xl bg-white/[.035] px-3 py-2">
                    <span>Irrigation actions</span>
                    <span className="interface font-extrabold text-[#b8f15a]">{digest.cycles}</span>
                  </li>
                  <li className="flex items-center justify-between rounded-xl bg-white/[.035] px-3 py-2">
                    <span>Water used today</span>
                    <span className="interface font-extrabold text-[#8fd3b4]">{state.waterToday.toFixed(1)} L</span>
                  </li>
                  <li className="flex items-center justify-between rounded-xl bg-white/[.035] px-3 py-2">
                    <span>Warnings worth reading</span>
                    <span className="interface font-extrabold text-[#ffd49c]">{digest.warnings}</span>
                  </li>
                  <li className="flex items-center justify-between rounded-xl bg-white/[.035] px-3 py-2">
                    <span>Tasks due</span>
                    <span className="interface font-extrabold text-[#efffd3]">{dueNow.length}</span>
                  </li>
                </ul>
                <p className="mt-3 text-xs leading-5 text-[#8fae93]">
                  A summary is a promise the product must keep — it is generated from the same log the{" "}
                  <Link href={demoLink("/alerts")} className="text-[#b8f15a] underline decoration-dotted">
                    alerts page
                  </Link>{" "}
                  shows, not from a separate narrative.
                </p>
              </div>
            ) : (
              <div className="demo-panel p-5">
                <DemoSectionTitle title="Daily digest" note="off" />
                <p className="text-sm leading-6 text-[#afc5a7]">The digest is disabled for this garden, so nothing is summarised at the end of the day. Warnings and the alert queue still work.</p>
                <Link href={demoLink("/settings")} className="interface mt-3 inline-block text-[.6rem] font-extrabold uppercase tracking-[.1em] text-[#b8f15a] hover:text-[#d0ff88]">
                  Turn it back on in settings →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
import { DemoPageHeader, DemoSectionTitle, StatTile, useDemoMeta } from "./ui";
