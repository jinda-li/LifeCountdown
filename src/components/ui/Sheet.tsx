import { AnimatePresence, motion } from "motion/react";
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
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-50 flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={`relative z-10 w-full rounded-t-[28px] bg-[var(--elevated)] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(40,24,8,0.12)] ${
              tall ? "max-h-[92%]" : "max-h-[86%]"
            } overflow-y-auto`}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[var(--line-strong)]" />
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[20px] font-semibold tracking-tight">{title}</h2>
                <button
                  onClick={onClose}
                  className="grid h-8 w-8 place-items-center rounded-full bg-[var(--fill)] text-[var(--secondary)]"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
