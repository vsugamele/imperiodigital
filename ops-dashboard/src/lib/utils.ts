// ========================================
// UTILITÁRIOS - Funções Helper
// ========================================

// --- Formatação de Datas ---

export function formatDate(date: string | Date, locale = "pt-BR"): string {
    return new Date(date).toLocaleDateString(locale);
}

export function formatTime(date: string | Date, locale = "pt-BR"): string {
    return new Date(date).toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit"
    });
}

export function formatDateTime(date: string | Date, locale = "pt-BR"): string {
    return new Date(date).toLocaleString(locale);
}

export function formatRelativeTime(date: string | Date): string {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "agora";
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return formatDate(date);
}

export function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
}

// --- Formatação de Números ---

export function formatNumber(num: number, locale = "pt-BR"): string {
    return num.toLocaleString(locale);
}

export function formatPercent(value: number, decimals = 0): string {
    return `${value.toFixed(decimals)}%`;
}

export function formatCurrency(value: number, currency = "BRL"): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency,
    }).format(value);
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatCompact(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
}

// --- Cores ---

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        healthy: "#4EDC88",
        ok: "#4EDC88",
        success: "#4EDC88",
        good: "#4EDC88",
        warning: "#F59E0B",
        running: "#F59E0B",
        pending: "#6B7280",
        critical: "#EF4444",
        error: "#EF4444",
        failed: "#EF4444",
        offline: "#6B7280",
        standby: "#3B82F6",
        thinking: "#8B5CF6",
        working: "#F59E0B",
    };
    return colors[status] || "#6B7280";
}

export function getProgressColor(progress: number): string {
    if (progress >= 80) return "#4EDC88";
    if (progress >= 50) return "#F59E0B";
    return "#EF4444";
}

// --- Strings ---

export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + "...";
}

export function slugify(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Arrays ---

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
        const group = String(item[key]);
        if (!result[group]) result[group] = [];
        result[group].push(item);
        return result;
    }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, order: "asc" | "desc" = "asc"): T[] {
    return [...array].sort((a, b) => {
        const valA = a[key];
        const valB = b[key];
        const comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
        return order === "asc" ? comparison : -comparison;
    });
}

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
    const seen = new Set();
    return array.filter(item => {
        const val = item[key];
        if (seen.has(val)) return false;
        seen.add(val);
        return true;
    });
}

// --- Objects ---

export function pick<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Pick<T, K> {
    return keys.reduce((result, key) => {
        if (key in obj) result[key] = obj[key];
        return result;
    }, {} as Pick<T, K>);
}

export function omit<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
}

// --- Async ---

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
    fn: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

// --- Validation ---

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// --- Cron ---

export function getNextCronRun(schedule: string): Date {
    // Simplified cron parser - for display purposes
    // In production, use cron-parser library
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Default: 30 min from now
    return now;
}

export function formatCronSchedule(schedule: string): string {
    const parts = schedule.split(" ");
    if (parts.length !== 5) return schedule;

    const [min, hour, dom, month, dow] = parts;

    if (dom === "*" && month === "*") {
        if (dow === "*") {
            return `Diário às ${hour}:${min.padStart(2, "0")}`;
        }
        const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
        return `${days[parseInt(dow)]} às ${hour}:${min.padStart(2, "0")}`;
    }

    return schedule;
}
