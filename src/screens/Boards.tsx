import { useMemo, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { snapshot } from "@/lib/life";
import { DateField } from "@/components/ui/DateField";
import { formatInt, formatDate } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import { useApp, type LifeTask, type TaskStatus } from "@/lib/store";
import { useNow } from "@/lib/useNow";
import { Plus } from "lucide-react";

const STATUS: { id: TaskStatus; label: string }[] = [
  { id: "wish", label: "愿望" },
  { id: "doing", label: "进行中" },
  { id: "done", label: "完成" },
];

export function BoardsScreen() {
  const now = useNow(60_000);
  const profile = useApp((s) => s.profile)!;
  const boards = useApp((s) => s.boards);
  const tasks = useApp((s) => s.tasks);
  const addBoard = useApp((s) => s.addBoard);
  const addTask = useApp((s) => s.addTask);
  const updateTask = useApp((s) => s.updateTask);
  const deleteTask = useApp((s) => s.deleteTask);
  const [boardId, setBoardId] = useState(boards[0]?.id ?? "");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [editing, setEditing] = useState<Partial<LifeTask> | null>(null);
  const [newBoard, setNewBoard] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");

  const life = snapshot({
    birthISO: profile.birthISO,
    countryId: profile.countryId,
    gender: profile.gender,
    now,
  });

  const filtered = useMemo(
    () =>
      tasks.filter((t) => t.boardId === boardId && (status === "all" || t.status === status)),
    [tasks, boardId, status],
  );

  const done = tasks.filter((t) => t.boardId === boardId && t.status === "done").length;
  const total = tasks.filter((t) => t.boardId === boardId).length;

  return (
    <>
      <div className="scroll pb-24">
        <p className="text-[13px] tracking-[0.16em] text-[var(--secondary)]">LIFE LIST</p>
        <h1 className="large-title mt-1">人生要做的事</h1>
        <p className="mt-3 text-[15px] leading-6 text-[var(--secondary)]">
          列出来，设定日期，尽早完成。你大约还有 {formatInt(life.remainingWeeks)} 周——现在就是最早的时候。
        </p>

        <div className="h-scroll mt-4 flex gap-2 pb-1">
          {boards.map((b) => (
            <button
              key={b.id}
              className={`chip max-w-[200px] shrink-0 ${boardId === b.id ? "on" : ""}`}
              onClick={() => {
                haptic();
                setBoardId(b.id);
              }}
            >
              <span className="truncate">{b.emoji} {b.title}</span>
            </button>
          ))}
          <button className="chip shrink-0" onClick={() => setNewBoard(true)}>
            + 新板
          </button>
          <span className="w-2 shrink-0" aria-hidden />
        </div>

        <div className="meter mt-3">
          <div
            className="meter-fill is-ok"
            style={{ width: `${total ? (done / total) * 100 : 0}%` }}
          />
        </div>
        <p className="mt-2 text-[12px] text-[var(--tertiary)]">
          {done}/{total || 0} 已完成
        </p>

        <div className="mt-3 flex gap-1.5">
          <button className={`chip min-w-0 flex-1 justify-center px-2 ${status === "all" ? "on" : ""}`} onClick={() => setStatus("all")}>
            全部
          </button>
          {STATUS.map((s) => (
            <button key={s.id} className={`chip min-w-0 flex-1 justify-center px-2 ${status === s.id ? "on" : ""}`} onClick={() => setStatus(s.id)}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {filtered.length === 0 && (
            <div className="card px-4 py-8 text-center text-[14px] text-[var(--secondary)]">
              这块板还空着。放一件你一直想做、却总说明天的事。
            </div>
          )}
          {filtered.map((t) => (
            <button
              key={t.id}
              className="card w-full px-4 py-4 text-left"
              onClick={() => setEditing(t)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="break-words text-[16px] font-medium">{t.title}</div>
                  {t.note && <div className="mt-1 line-clamp-2 text-[13px] text-[var(--secondary)]">{t.note}</div>}
                </div>
                <span className="shrink-0 text-[11px] text-[var(--tertiary)]">
                  {STATUS.find((s) => s.id === t.status)?.label}
                </span>
              </div>
              {t.due && (
                <p className="mt-2 text-[12px] text-[var(--secondary)]">
                  希望在 {formatDate(t.due).replace(/星期./, "")} 前 · 还有约 {formatInt(life.remainingWeeks)} 周人生
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="fab"
        aria-label="添加一件事"
        onClick={() =>
          setEditing({
            boardId,
            title: "",
            note: "",
            status: "wish",
          })
        }
      >
        <Plus size={22} strokeWidth={2.2} />
      </button>

      <Sheet open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.id ? "这件事" : "新的一件事"} tall>
        {editing && (
          <TaskForm
            task={editing}
            weeks={life.remainingWeeks}
            onChange={setEditing}
            onSave={() => {
              if (!editing.title?.trim()) return;
              haptic();
              if (editing.id) {
                updateTask(editing.id, {
                  ...editing,
                  doneAt: editing.status === "done" ? new Date().toISOString() : undefined,
                });
              } else {
                addTask({
                  boardId: editing.boardId || boardId,
                  title: editing.title.trim(),
                  note: editing.note ?? "",
                  status: editing.status ?? "wish",
                  due: editing.due,
                });
              }
              setEditing(null);
            }}
            onDelete={() => {
              if (editing.id) deleteTask(editing.id);
              setEditing(null);
            }}
          />
        )}
      </Sheet>

      <Sheet open={newBoard} onClose={() => setNewBoard(false)} title="新的一块板">
        <input className="ios-input" placeholder="例如 想写的书" value={boardTitle} onChange={(e) => setBoardTitle(e.target.value)} />
        <button
          className="primary-btn mt-4"
          onClick={() => {
            if (!boardTitle.trim()) return;
            addBoard(boardTitle.trim(), "▹");
            setBoardTitle("");
            setNewBoard(false);
          }}
        >
          添加
        </button>
      </Sheet>
    </>
  );
}

function TaskForm({
  task,
  weeks,
  onChange,
  onSave,
  onDelete,
}: {
  task: Partial<LifeTask>;
  weeks: number;
  onChange: (t: Partial<LifeTask>) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <div>
      <input
        className="ios-input"
        placeholder="要做的事"
        value={task.title ?? ""}
        onChange={(e) => onChange({ ...task, title: e.target.value })}
      />
      <textarea
        className="ios-input mt-3 min-h-[90px]"
        placeholder="为什么现在就要开始"
        value={task.note ?? ""}
        onChange={(e) => onChange({ ...task, note: e.target.value })}
      />
      <p className="mb-2 mt-4 text-[13px] text-[var(--secondary)]">状态</p>
      <div className="flex gap-2">
        {STATUS.map((s) => (
          <button
            key={s.id}
            className={`chip flex-1 ${task.status === s.id ? "on" : ""}`}
            onClick={() => onChange({ ...task, status: s.id })}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="mb-2 mt-4 text-[13px] text-[var(--secondary)]">希望完成的日期</p>
      <DateField
        value={task.due ?? ""}
        placeholder="不设日期也可以"
        onChange={(v) => onChange({ ...task, due: v || undefined })}
      />
      <p className="mt-3 text-[13px] leading-6 text-[var(--secondary)]">
        统计上你大约还有 {formatInt(weeks)} 周。把日期设近一点，人生会跟着热起来。
      </p>
      <button className="primary-btn mt-5" onClick={onSave} disabled={!task.title?.trim()}>
        保存
      </button>
      {task.id && (
        <button className="ghost-btn mt-2 text-[var(--danger)]" onClick={onDelete}>
          删除
        </button>
      )}
    </div>
  );
}
