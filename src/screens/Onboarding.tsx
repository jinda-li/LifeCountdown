import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BlurFade } from "@/components/ui/BlurFade";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { searchCountries, snapshot, type Gender, getCountry } from "@/lib/life";
import { useApp } from "@/lib/store";
import { haptic, hapticSuccess } from "@/lib/haptics";
import { addDays, formatInt, pad2, toISODate } from "@/lib/format";

const GENDERS: { id: Gender; label: string; hint: string }[] = [
  { id: "female", label: "女", hint: "按女性预期寿命估算" },
  { id: "male", label: "男", hint: "按男性预期寿命估算" },
  { id: "other", label: "不愿透露", hint: "使用当地平均预期寿命" },
];

export function Onboarding() {
  const complete = useApp((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [birthISO, setBirthISO] = useState("");
  const [gender, setGender] = useState<Gender>("other");
  const [countryId, setCountryId] = useState("china");
  const [city, setCity] = useState("");
  const [q, setQ] = useState("");
  const countries = useMemo(() => searchCountries(q), [q]);
  const selected = getCountry(countryId);

  const maxDate = toISODate(new Date());

  const canNext =
    step === 0 ||
    step === 1 ||
    (step === 2 && Boolean(birthISO)) ||
    step === 3 ||
    (step === 4 && Boolean(countryId));

  const go = () => {
    haptic(10);
    if (step < 5) setStep(step + 1);
  };

  const preview =
    birthISO && countryId
      ? snapshot({ birthISO, countryId, gender })
      : null;

  const finish = () => {
    hapticSuccess();
    complete({
      name: name.trim() || "你",
      birthISO,
      countryId,
      city: city.trim(),
      gender,
    });
  };

  const demo = () => {
    haptic();
    complete({
      name: "体验者",
      birthISO: "1996-08-18",
      countryId: "china",
      city: "上海",
      gender: "other",
    });
    const today = toISODate(new Date());
    const yest = addDays(today, -1);
    useApp.setState({
      journals: {
        [yest]: {
          date: yest,
          did: "下班后沿着河走了一圈，没有看手机。",
          grateful: "风是凉的，路灯是暖的。",
          meaningful: 3,
          updatedAt: new Date().toISOString(),
        },
      },
      tasks: [
        {
          id: crypto.randomUUID(),
          boardId: "places",
          title: "去一次没有计划的海边",
          note: "不必等年假。挑一个周末就出发。",
          status: "wish",
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          boardId: "skills",
          title: "把家里那本没读完的书读完",
          note: "每天十页。",
          status: "doing",
          createdAt: new Date().toISOString(),
        },
      ],
      light: 2,
      unlockedSkins: ["digits", "progress"],
      unlockedMetrics: ["weeks", "sunrises", "meals", "weekends", "seasons"],
      skin: "progress",
      selectedMetrics: ["weeks", "sunrises", "meals", "weekends"],
    });
  };

  return (
    <div className="screen">
      <div className="scroll flex flex-col">
        <div className="mb-8 flex gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="h-1 flex-1 rounded-full"
              style={{ background: i <= step ? "var(--ink)" : "var(--fill)" }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="0" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <p className="text-[13px] tracking-[0.22em] text-[var(--secondary)]">YOUNGEST</p>
              <h1 className="large-title mt-3">
                今天，是你余生里
                <br />
                最年轻的一天。
              </h1>
              <p className="mt-5 text-[16px] leading-7 text-[var(--secondary)]">
                根据出生地的预期寿命，看见时间还剩多少。把每一天过成值得被记住的一天，少一些烦恼，多一些在场。
              </p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <h1 className="large-title">怎么称呼你</h1>
              <p className="mt-3 mb-6 text-[15px] text-[var(--secondary)]">可以只是一个字。也可以先跳过。</p>
              <input
                className="ios-input"
                placeholder="你的名字（选填）"
                value={name}
                maxLength={12}
                onChange={(e) => setName(e.target.value)}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <h1 className="large-title">你哪一天来到世上</h1>
              <p className="mt-3 mb-6 text-[15px] text-[var(--secondary)]">年月日即可。我们用来推算还剩下的时间。</p>
              <BirthPicker value={birthISO} onChange={setBirthISO} max={maxDate} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <h1 className="large-title">性别</h1>
              <p className="mt-3 mb-6 text-[15px] text-[var(--secondary)]">
                只用于匹配当地分性别的预期寿命，不会上传。
              </p>
              <div className="flex flex-col gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g.id}
                    className={`card px-4 py-4 text-left ${gender === g.id ? "ring-2 ring-[var(--ink)]" : ""}`}
                    onClick={() => {
                      haptic();
                      setGender(g.id);
                    }}
                  >
                    <div className="text-[17px] font-medium">{g.label}</div>
                    <div className="mt-1 text-[13px] text-[var(--secondary)]">{g.hint}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <h1 className="large-title">出生地</h1>
              <p className="mt-3 mb-4 text-[15px] text-[var(--secondary)]">
                用联合国 2023 年出生时预期寿命。城市选填，只用来记住你。
              </p>
              <input
                className="ios-input mb-3"
                placeholder="搜索国家 / 地区，如 中国、日本、美国"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <input
                className="ios-input mb-3"
                placeholder="城市（选填）例如 杭州"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <div className="themed-scroll max-h-[42vh] overflow-y-auto rounded-[18px] bg-[var(--elevated)]">
                {countries.map((c) => (
                  <button
                    key={c.id}
                    className={`flex w-full items-center justify-between border-b border-[var(--line)] px-4 py-3 text-left last:border-0 ${countryId === c.id ? "bg-[var(--fill)]" : ""}`}
                    onClick={() => {
                      haptic();
                      setCountryId(c.id);
                    }}
                  >
                    <span>
                      <span className="text-[16px]">{c.nameZh}</span>
                      <span className="ml-2 text-[12px] text-[var(--tertiary)]">{c.nameEn}</span>
                    </span>
                    <span className="text-[13px] tabular-nums text-[var(--secondary)]">
                      {gender === "female" ? c.female : gender === "male" ? c.male : c.le} 岁
                    </span>
                    {countryId === c.id && <span className="ml-2 text-[var(--accent)]">✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 5 && preview && (
            <motion.div key="5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <p className="text-[13px] tracking-[0.18em] text-[var(--secondary)]">统计意义上</p>
              <h1 className="large-title mt-2">你大约还剩</h1>
              <BlurFade delay={0.15} className="mt-8 text-center">
                <div className="font-display text-[56px] font-semibold leading-none tracking-[-0.04em]">
                  <NumberTicker value={Math.round(preview.remainingWeeks)} delay={0.1} />
                </div>
                <div className="mt-2 text-[13px] tracking-[0.2em] text-[var(--secondary)]">周</div>
              </BlurFade>
              <p className="mt-8 text-center text-[15px] leading-7 text-[var(--secondary)]">
                按{selected?.nameZh}
                {city ? ` · ${city}` : ""}的预期寿命估算，大约还有{" "}
                <span className="text-[var(--ink)]">{formatInt(preview.remainingHours)} 小时</span>
                。这不是判决，是提醒：把烦恼放下，去过今天。
              </p>
              <p className="mt-4 text-center text-[12px] text-[var(--tertiary)]">
                已活过 {(preview.livedRatio * 100).toFixed(1)}% · 数据来自联合国 2023
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto pt-8">
          {step === 0 && (
            <button className="ghost-btn mb-2 text-[var(--secondary)]" onClick={demo}>
              先体验一下
            </button>
          )}
          {step > 0 && step < 5 && (
            <button className="ghost-btn mb-2" onClick={() => setStep(step - 1)}>
              返回
            </button>
          )}
          {step < 5 ? (
            <button className="primary-btn disabled:opacity-40" disabled={!canNext} onClick={go}>
              {step === 0 ? "开始" : "继续"}
            </button>
          ) : (
            <button className="primary-btn" onClick={finish}>
              进入今天
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BirthPicker({
  value,
  onChange,
  max,
}: {
  value: string;
  onChange: (v: string) => void;
  max: string;
}) {
  const maxY = Number(max.slice(0, 4));
  const parsed = value ? value.split("-").map(Number) : [0, 0, 0];
  const [year, setYear] = useState(parsed[0] || 0);
  const [month, setMonth] = useState(parsed[1] || 0);
  const [day, setDay] = useState(parsed[2] || 0);

  const years = Array.from({ length: maxY - 1919 }, (_, i) => maxY - i);
  const daysInMonth = year && month ? new Date(year, month, 0).getDate() : 31;

  const apply = (y: number, m: number, d: number) => {
    const dim = y && m ? new Date(y, m, 0).getDate() : 31;
    const nextDay = d ? Math.min(d, dim) : 0;
    setYear(y);
    setMonth(m);
    setDay(nextDay);
    if (y && m && nextDay) onChange(`${y}-${pad2(m)}-${pad2(nextDay)}`);
    else onChange("");
  };

  return (
    <div>
      <input
        className="ios-input date-input"
        type="date"
        min="1920-01-01"
        max={max}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v);
          if (!v) {
            setYear(0);
            setMonth(0);
            setDay(0);
            return;
          }
          const [y, m, d] = v.split("-").map(Number);
          setYear(y);
          setMonth(m);
          setDay(d);
        }}
      />
      <p className="mt-4 mb-2 text-[12px] text-[var(--tertiary)]">或点下面的数字，选完年、月、日即可继续</p>
      <div className="grid grid-cols-3 gap-2">
        <Wheel
          label="年"
          values={years}
          value={year}
          onChange={(y) => apply(y, month, day || 1)}
        />
        <Wheel
          label="月"
          values={Array.from({ length: 12 }, (_, i) => i + 1)}
          value={month}
          onChange={(m) => apply(year, m, day || 1)}
        />
        <Wheel
          label="日"
          values={Array.from({ length: daysInMonth }, (_, i) => i + 1)}
          value={day}
          onChange={(d) => apply(year, month, d)}
        />
      </div>
    </div>
  );
}

function Wheel({
  label,
  values,
  value,
  onChange,
}: {
  label: string;
  values: number[];
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-center text-[12px] text-[var(--secondary)]">{label}</div>
      <div className="wheel-scroll h-[196px] overflow-y-auto rounded-[16px] bg-[var(--fill)] py-1">
        {values.map((n) => (
          <button
            key={n}
            type="button"
            className={`flex h-10 w-full items-center justify-center text-[17px] tabular-nums ${
              value === n ? "rounded-[12px] bg-[var(--elevated)] font-semibold text-[var(--ink)]" : "text-[var(--secondary)]"
            }`}
            onClick={() => {
              haptic();
              onChange(n);
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
