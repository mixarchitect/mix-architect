"use client";

import { cn } from "@/lib/cn";
import type { WorkflowStep } from "@/lib/help/types";
import {
  LayoutDashboard,
  Disc3,
  Music,
  Users,
  Upload,
  Image,
  ListChecks,
  CheckCircle2,
  Send,
  UserPlus,
  Eye,
  AudioWaveform,
  GitBranch,
  Settings,
  Download,
  Play,
  MousePointerClick,
  MessageSquare,
  ClipboardList,
  UserCheck,
  BarChart3,
  Calendar,
  MapPin,
  Bell,
  LayoutTemplate,
  Wrench,
  FileDown,
  CreditCard,
  ArrowUpCircle,
  Receipt,
  XCircle,
  Clock,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Disc3,
  Music,
  Users,
  Upload,
  Image,
  ListChecks,
  CheckCircle2,
  Send,
  UserPlus,
  Eye,
  AudioWaveform,
  GitBranch,
  Settings,
  Download,
  Play,
  MousePointerClick,
  MessageSquare,
  ClipboardList,
  UserCheck,
  BarChart3,
  Calendar,
  MapPin,
  Bell,
  LayoutTemplate,
  Wrench,
  FileDown,
  CreditCard,
  ArrowUpCircle,
  Receipt,
  XCircle,
  Clock,
  RefreshCw,
};

type Props = {
  steps: WorkflowStep[];
};

export function WorkflowSteps({ steps }: Props) {
  const count = steps.length;

  return (
    <div className="my-5 py-4 overflow-x-auto no-scrollbar">
      <div className="flex items-start justify-center gap-0 min-w-max px-4">
        {steps.map((step, i) => {
          const Icon = ICON_MAP[step.icon] ?? Disc3;
          return (
            <div key={i} className="flex items-start">
              {/* Step */}
              <div
                className="flex flex-col items-center gap-2 workflow-step"
                style={
                  {
                    "--step-index": i,
                    "--step-count": count,
                  } as React.CSSProperties
                }
              >
                <div className="w-11 h-11 rounded-full border-2 border-current flex items-center justify-center transition-colors">
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <span className="text-[11px] font-medium whitespace-nowrap max-w-[80px] text-center leading-tight">
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {i < count - 1 && (
                <div className="flex items-center h-11 px-1">
                  <div className="w-10 h-[2px] bg-border relative overflow-hidden rounded-full">
                    <div
                      className="absolute inset-0 bg-signal workflow-connector"
                      style={
                        {
                          "--step-index": i,
                          "--step-count": count,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
