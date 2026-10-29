"use client";

import { motion } from "motion/react";
import { FileText, HelpCircle, ListChecks, SearchCode } from "lucide-react";
import { promptTemplates } from "@/lib/templates";
import type { PromptTemplate } from "@/lib/types";

const ICONS: Record<PromptTemplate["icon"], typeof FileText> = {
  file: FileText,
  help: HelpCircle,
  list: ListChecks,
  search: SearchCode,
};

const ICON_COLORS: Record<PromptTemplate["icon"], string> = {
  file: "text-accent-400 bg-accent-500/10",
  help: "text-red-400 bg-red-500/10",
  list: "text-amber-500 bg-amber-500/10",
  search: "text-base-300 bg-base-700/50",
};

export function TemplateGrid({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      {promptTemplates.map((tpl, i) => {
        const Icon = ICONS[tpl.icon];
        return (
          <motion.button
            key={tpl.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35, ease: "easeOut" }}
            whileHover={{ y: -2 }}
            onClick={() => onSelect(tpl.prompt)}
            className="flex flex-col items-start gap-1 rounded-xl border border-base-700 bg-base-850/80 p-4 text-left transition-colors hover:border-accent-500/40 hover:bg-base-800"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-md ${ICON_COLORS[tpl.icon]}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-medium text-accent-300">{tpl.title}</span>
            </div>
            <p className="text-xs leading-relaxed text-base-400">{tpl.description}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
