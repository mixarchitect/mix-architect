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
      <h1 className="text-sm text-muted truncate">
        <button
          type="button"
          onClick={closeFlow}
          className="hover:text-text transition-colors"
        >
          {title}
        </button>
      </h1>
    );
  }

  if (canEdit) {
    return (
      <h1>
        <EditableTitle
          value={title}
          table="releases"
          id={releaseId}
          className="text-2xl font-semibold h2 text-text"
        />
      </h1>
    );
  }

  return (
    <h1 className="text-2xl font-semibold h2 text-text truncate">{title}</h1>
  );
}
