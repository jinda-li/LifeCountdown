import { CalendarDays, Grid2x2, House, ListTodo, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TabId } from "@/lib/store";
import { haptic } from "@/lib/haptics";

const TABS: { id: TabId; label: string; Icon: typeof House }[] = [
  { id: "home", label: "此刻", Icon: House },
  { id: "grid", label: "格子", Icon: Grid2x2 },
  { id: "journal", label: "日记", Icon: CalendarDays },
  { id: "boards", label: "清单", Icon: ListTodo },
  { id: "me", label: "我的", Icon: UserRound },
];

export function TabBar({
  tab,
  onChange,
  badge,
}: {
  tab: TabId;
  onChange: (t: TabId) => void;
  badge?: Partial<Record<TabId, boolean>>;
}) {
  return (
    <nav className="tabbar">
      {TABS.map(({ id, label, Icon }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            className={cn("tab-item", active && "active")}
            onClick={() => {
              haptic(8);
              onChange(id);
            }}
          >
            <span className="relative">
              <Icon size={22} strokeWidth={active ? 2.2 : 1.7} />
              {badge?.[id] && <span className="tab-dot" />}
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
