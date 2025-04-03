/**
 * @file EntitySelectionDrawer.tsx
 *
 * This component provides a consistent mobile-friendly drawer UI for selecting and configuring
 * medical entities like medications, allergies, symptoms, and diagnoses. It handles the common
 * pattern of:
 *
 * 1. Showing a trigger button for adding a new entity
 * 2. Opening a drawer with a search interface for finding entities
 * 3. After selection, showing a form for configuring entity details
 * 4. Providing buttons for confirming or canceling the addition
 *
 * The component is generic and can be used across different entity types by providing
 * the appropriate props
 *
 */
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { Code } from "@/types/questionnaire/code";

import ValueSetSelect from "./ValueSetSelect";

interface EntitySelectionDrawerProps {
  /**
   * Whether the drawer is open
   */
  open: boolean;
  /**
   * Callback when the open state changes
   * @param open The new open state
   */
  onOpenChange: (open: boolean) => void;
  /**
   * The currently selected code/entity
   * Set to null when no entity is selected (showing search)
   */
  selectedEntity: Code | null;
  /**
   * The system to use for the ValueSet lookup
   * Examples: "system-medication", "system-condition-code", "system-allergy-code"
   */
  system: string;
  /**
   * The entity type being selected (for display and translation)
   * This is used to build translation keys like "add_another_{entityType}" or "select_{entityType}"
   * Examples: "medication", "diagnosis", "symptom", "allergy"
   */
  entityType: string;
  /**
   * Optional postfix to append to search queries
   * For example, " clinical drug" for medications
   */
  searchPostFix?: string;
  /**
   * Whether the form is disabled
   * When true, prevents interaction with the form elements
   */
  disabled?: boolean;
  /**
   * Callback when an entity is selected from the ValueSet
   * This is typically used to set state that tracks the selected entity
   * @param code The selected code
   */
  onSelect: (code: Code) => void;
  /**
   * Context-aware back handler function
   * This function should:
   * 1. Check if an entity is selected (selectedEntity is not null)
   * 2. If an entity is selected, clear it and go back to the search view
   * 3. If no entity is selected, close the drawer entirely
   *
   * Typical implementation:
   * ```
   * const handleBack = () => {
   *   if (selectedEntity) {
   *     // Go back to search by clearing the selection
   *     setSelectedEntity(null);
   *     // Reset form state
   *     setFormState({...INITIAL_VALUE});
   *   } else {
   *     // Close the drawer
   *     setIsDrawerOpen(false);
   *   }
   * };
   * ```
   */
  onBack: () => void;
  /**
   * Function to handle confirming the current entity selection
   * This is called when the user clicks the "Add" button
   */
  onConfirm: () => void;
  /**
   * Optional addition to the title in the header
   * This is appended to the title in the format "select_{entityType} {titleAddition}"
   */
  titleAddition?: string;
  /**
   * Content to display when an entity is selected (the form for entity details)
   * This should be a React node that contains the form elements for configuring the entity
   */
  entityDetailsContent: ReactNode;
  /**
   * Optional add placeholder text override
   */
  addPlaceholder?: string;
  /**
   * Optional text for the confirm button
   * By default, uses "add" as the translation key
   */
  confirmButtonText?: string;
  /**
   * Optional custom class names for the buttons
   */
  buttonClassName?: string;
}

/**
 * A reusable drawer component for selecting and configuring entities like medications,
 * allergies, symptoms, etc. in a mobile-friendly interface.
 *
 * This component handles the common pattern of selecting an entity from a ValueSet,
 * then showing a form to configure the details of that entity before adding it.
 */
export function EntitySelectionDrawer({
  open,
  onOpenChange,
  selectedEntity,
  system,
  entityType,
  searchPostFix = "",
  disabled = false,
  onSelect,
  onBack,
  onConfirm,
  titleAddition = "",
  entityDetailsContent,
  addPlaceholder,
  confirmButtonText,
}: EntitySelectionDrawerProps) {
  const { t } = useTranslation();

  return (
    <>
      <ValueSetSelect
        system={system}
        placeholder={addPlaceholder}
        onSelect={onSelect}
        disabled={disabled}
        searchPostFix={searchPostFix}
        title={t(
          `select_${entityType}${titleAddition ? ` ${titleAddition}` : ""}`,
        )}
        onBack={onBack}
      />
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="mx-2 rounded-t-md pb-2">
          {selectedEntity ? (
            <div className="flex flex-col" style={{ minHeight: "400px" }}>
              <div className="flex justify-between w-full p-2">
                <Button
                  variant="link"
                  onClick={onBack}
                  className="underline text-sm"
                >
                  {t("cancel")}
                </Button>
                <Button
                  variant="primary"
                  onClick={onConfirm}
                  className="text-sm"
                >
                  {t(confirmButtonText || t("done"))}
                </Button>
              </div>
              <DrawerHeader className="py-2 px-2 border-b border-gray-200">
                <DrawerTitle className="text-center text-base font-semibold">
                  {selectedEntity.display}
                </DrawerTitle>
              </DrawerHeader>
              <div className="max-h-[100dvh] overflow-y-auto pb-20">
                {entityDetailsContent}
              </div>
            </div>
          ) : (
            <div style={{ minHeight: "400px" }}>
              <ValueSetSelect
                system={system}
                placeholder={addPlaceholder}
                onSelect={onSelect}
                disabled={disabled}
                hideTrigger={true}
                controlledOpen={true}
                searchPostFix={searchPostFix}
                title={t(`select_${entityType}`)}
                onBack={onBack}
              />
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
