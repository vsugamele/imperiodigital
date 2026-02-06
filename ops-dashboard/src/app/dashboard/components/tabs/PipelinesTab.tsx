/**
 * PipelinesTab Component
 * ======================
 * 
 * Tab que exibe lista detalhada de todos os pipelines.
 * Cada pipeline mostra os steps visuais do processo.
 */

"use client";

import React from "react";
import type { PipelineStatus } from "@/types";
import { PipelineCardExpanded } from "../cards/PipelineCard";

interface PipelinesTabProps {
    pipelines: PipelineStatus[];
}

export function PipelinesTab({ pipelines }: PipelinesTabProps) {
    return (
        <div>
            {pipelines.map(pipeline => (
                <PipelineCardExpanded
                    key={pipeline.product}
                    pipeline={pipeline}
                />
            ))}
        </div>
    );
}
