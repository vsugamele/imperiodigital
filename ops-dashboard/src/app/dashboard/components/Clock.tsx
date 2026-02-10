/**
 * Dedicated Clock Component
 * =========================
 * 
 * Isolates the 1Hz update logic to prevent the entire Dashboard
 * from re-rendering every second.
 */

"use client";

import React, { useState, useEffect } from "react";

export const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-slate-200">
                {time.toLocaleTimeString("pt-BR", { hour12: false })}
            </span>
            <span className="text-[10px] text-slate-400">
                {time.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                })}
            </span>
        </div>
    );
};
