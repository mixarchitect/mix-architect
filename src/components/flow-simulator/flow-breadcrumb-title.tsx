"use client";

import { EditableTitle } from "@/components/ui/editable-title";
import { useFlowOpen } from "./release-flow-context";

type Props = {
  title: string;
  releaseId: string;
  canEdit: boolean;
};

/**
 * In the release page breadcrumb, shows the release title.
 * When the flow simulator is open, clicking closes it.
 * When closed, shows the editable title (if user can edit).
 */
export function FlowBreadcrumbTitle({ title, releaseId, canEdit }: Props) {
  const { isFlowOpen, closeFlow } = useFlowOpen();

  if (isFlowOpen) {
    return (
      <button
        type="button"
        onClick={closeFlow}
        className="text-sm text-muted hover:text-text transition-colors truncate"
      >
        {title}
      </button>
    );
  }

  if (canEdit) {
    return (
      <EditableTitle
        value={title}
        table="releases"
        id={releaseId}
        className="text-2xl font-semibold h2 text-text"
      />
    );
  }

  return (
    <h1 className="text-2xl font-semibold h2 text-text truncate">{title}</h1>
  );
}
