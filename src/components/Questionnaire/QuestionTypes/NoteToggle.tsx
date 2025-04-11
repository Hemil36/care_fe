import { useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import CareIcon from "@/CAREUI/icons/CareIcon";

import { Button } from "@/components/ui/button";

import type { QuestionnaireResponse } from "@/types/questionnaire/form";

interface NoteToggleProps {
  questionnaireResponse: QuestionnaireResponse;
  disabled?: boolean;
  className?: string;
  onToggle?: (isVisible: boolean) => void;
}

export function NoteToggle({
  questionnaireResponse,
  disabled,
  className,
  onToggle,
}: NoteToggleProps) {
  const { t } = useTranslation();
  const [isNotesVisible, setNotesVisible] = useState(false);
  const notes = questionnaireResponse.note || "";
  const hasNotes = notes.length > 0;

  function handleToggleNotes() {
    const newState = !isNotesVisible;
    setNotesVisible(newState);
    onToggle?.(newState);
  }

  return (
    <div className={cn("space-y-2 rounded-md flex items-center", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleNotes}
        disabled={disabled}
        data-cy="notes"
        className="h-full w-28 text-sm font-normal text-gray-700 hover:text-gray-900 gap-1 bg-gray-50 rounded-none"
      >
        {hasNotes ? (
          <div className="size-1.5 rounded-full bg-orange-400" />
        ) : (
          <CareIcon icon="l-plus" className="size-4 text-gray-700" />
        )}
        <span className="underline text-gray-950 font-medium">
          {isNotesVisible
            ? t("hide_note")
            : hasNotes
              ? t("view_note")
              : t("add_note")}
        </span>
      </Button>
    </div>
  );
}
