"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useState, type FocusEvent, type PointerEvent, type ReactNode } from "react";

type TooltipPosition = {
  left: number;
  top: number;
};

type HeatmapCellProps = {
  ariaLabel?: string;
  children: ReactNode;
  className: string;
  href?: string;
  label: string;
};

function keepTooltipInsideViewport(left: number, top: number): TooltipPosition {
  if (typeof window === "undefined") return { left, top };

  return {
    left: Math.min(window.innerWidth - 150, Math.max(150, left)),
    top: Math.max(70, top),
  };
}

export function HeatmapCell({
  ariaLabel,
  children,
  className,
  href,
  label,
}: HeatmapCellProps) {
  const [tooltip, setTooltip] = useState<TooltipPosition | null>(null);

  function showFromPointer(event: PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setTooltip(
      keepTooltipInsideViewport(bounds.left + bounds.width / 2, bounds.top - 10),
    );
  }

  function showFromFocus(event: FocusEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setTooltip(
      keepTooltipInsideViewport(bounds.left + bounds.width / 2, bounds.top - 10),
    );
  }

  const interactionProps = {
    "aria-label": ariaLabel ?? label,
    className,
    onBlur: () => setTooltip(null),
    onFocus: showFromFocus,
    onPointerEnter: showFromPointer,
    onPointerLeave: () => setTooltip(null),
  };

  return (
    <>
      {href ? (
        <Link href={href} {...interactionProps}>
          {children}
        </Link>
      ) : (
        <span role="img" tabIndex={0} {...interactionProps}>
          {children}
        </span>
      )}
      {tooltip && typeof document !== "undefined"
        ? createPortal(
            <div
              className="heatmap-floating-tooltip"
              role="tooltip"
              style={{ left: tooltip.left, top: tooltip.top }}
            >
              {label}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
