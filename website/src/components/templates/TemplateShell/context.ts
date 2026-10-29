import React from "react";
import type { TemplateLayout } from "@/lib/templateLayout";

/** The layout the enclosing TemplateShell draws, for pieces seated inside it. */
export const TemplateShellContext = React.createContext<TemplateLayout | undefined>(undefined);
