import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../utils/cn';

interface CustomDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const listVariants: Variants = {
  hidden: { opacity: 0, y: -5, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 500, damping: 30, staggerChildren: 0.03 }
  },
  exit: { opacity: 0, y: -5, scale: 0.98, transition: { duration: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full font-mono">
      <motion.button
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 hud-panel border-cyan-500/30 transition-all text-sm",
          disabled && "opacity-50 cursor-not-allowed border-white/10"
        )}
      >
        <span className="font-semibold text-cyan-50 tracking-wider">[{value}]</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <ChevronDown className="w-5 h-5 text-cyan-500" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute z-50 w-full mt-2 hud-panel bg-slate-950/95 border-cyan-500/50 p-1"
            >
              {options.map((option) => (
                <motion.button
                  variants={itemVariants}
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-cyan-900/40 border border-transparent hover:border-cyan-500/30"
                >
                  <span className={cn(
                    "font-medium text-xs tracking-widest uppercase transition-colors",
                    value === option ? "text-cyan-400 drop-shadow-[0_0_5px_cyan]" : "text-cyan-100/60"
                  )}>
                    {option}
                  </span>
                  {value === option && <Check className="w-4 h-4 text-cyan-400" />}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
