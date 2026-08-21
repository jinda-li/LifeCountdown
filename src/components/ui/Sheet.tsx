import { AnimatePresence, motion, useDragControls } from "motion/react";
import { X } from "lucide-react";

export function Sheet({
  open,
  onClose,
  title,
  children,
  tall,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  tall?: boolean;
}) {
  const controls = useDragControls();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-50 flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="关闭"
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragMomentum={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.55 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 88 || info.velocity.y > 720) onClose();
            }}
            className={`relative z-10 w-full overflow-y-auto overscroll-contain rounded-t-[28px] bg-[var(--elevated)] shadow-[0_-12px_40px_rgba(40,24,8,0.12)] ${
              tall ? "max-h-[92%]" : "max-h-[86%]"
            }`}
          >
            <div className="sticky top-0 z-10 bg-[var(--elevated)]">
              <div className="sheet-grabber-hit" onPointerDown={(e) => controls.start(e)}>
                <div className="sheet-grabber" />
              </div>
              {title && (
                <div className="flex items-center justify-between gap-3 px-5 pb-3">
                  <h2 className="min-w-0 truncate text-[20px] font-semibold tracking-tight">{title}</h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="grid h-8 w-8 place-items-center rounded-full bg-[var(--fill)] text-[var(--secondary)]"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="px-5 pb-[max(20px,env(safe-area-inset-bottom))]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
