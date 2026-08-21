import { formatZhYMD } from "@/lib/format";

export function DateField({
  value,
  onChange,
  min,
  max,
  placeholder = "选择日期",
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
}) {
  return (
    <div className="date-field">
      <span className={`date-field-face ${value ? "" : "is-placeholder"}`}>
        {value ? formatZhYMD(value) : placeholder}
      </span>
      <input
        type="date"
        className="date-field-native"
        min={min}
        max={max}
        value={value}
        aria-label={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
