// ========================================
// TIPOS CENTRALIZADOS - ops-dashboard
// ========================================

// --- Sistema & Status ---

export type SystemStatus = "thinking" | "working" | "standby" | "error";
export type HealthStatus = "healthy" | "warning" | "critical" | "offline";
export type JobStatus = "ok" | "failed" | "running" | "pending";
export type MetricStatus = "good" | "warning" | "critical";

// --- Alex AI Status ---

export interface AlexStatus {
    status: SystemStatus;
    currentTask: string | null;
    lastActivity: string;
    uptime: number;
    memory: number;
    messagesProcessed: number;
    automationsRunning: number;
    cpu: number;
}

// --- Pipelines ---

export interface PipelineStatus {
    product: string;
    status: HealthStatus;
    currentStep: string;
    progress: number;
    lastRun: string;
    nextScheduled: string;
    videosToday: number;
    costToday: number;
}

// --- Cron Jobs ---

export interface CronJob {
    name: string;
    schedule: string;
    nextRun: string;
    lastRun: string;
    status: JobStatus;
}

// --- Metrics ---

export interface SystemMetric {
    name: string;
    value: number;
    unit: string;
    status: MetricStatus;
}

// --- Chat ---

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    time: string;
    toolCalls?: ToolCall[];
}

export interface ToolCall {
    name: string;
    status: 'running' | 'done';
    result?: string;
}

// --- Ofertas ---

export interface Oferta {
    nome: string;
    safeName: string;
    status: {
        fase: number;
        progresso: string;
        proximo: string;
        hipoteseVencedora?: string;
    };
    fases: Record<string, FaseStatus>;
    createdAt: string;
    metricas?: OfertaMetricas;
}

export interface FaseStatus {
    status: string;
    completo: boolean;
    arquivo?: string;
}

export interface OfertaMetricas {
    doresIdentificadas?: number;
    headlinesCriadas?: number;
    bonusEstrategicos?: number;
}

// --- Research ---

export interface ResearchResult {
    keyword?: string;
    niche?: string;
    timestamp: string;
    seoScore?: number;
    relatedKeywords?: RelatedKeyword[];
    trends?: Trend[];
    contentIdeas?: ContentIdea[];
}

export interface RelatedKeyword {
    keyword: string;
    score: number;
    type: string;
}

export interface Trend {
    keyword: string;
    trend: number;
    growth: string;
}

export interface ContentIdea {
    platform: string;
    type: string;
    title: string;
}

// --- Arquivos ---

export interface ArquivoItem {
    nome: string;
    caminho: string;
    tipo: 'pasta' | 'arquivo';
    tamanho?: number;
    modificado?: string;
}

export interface ArquivoInfo {
    tipo: 'markdown' | 'json' | 'texto' | 'codigo' | 'outro';
    caminho: string;
    nome: string;
    tamanho: number;
    modificado: string;
    conteudo?: string;
}

// --- Governance ---

export interface CouncilMember {
    id: string;
    name: string;
    role: string;
    avatar: string;
    specialty: string;
}

export interface Decision {
    id: string;
    title: string;
    status: 'pending' | 'approved' | 'rejected' | 'reviewing';
    votes: Vote[];
    createdAt: string;
}

export interface Vote {
    memberId: string;
    vote: 'approve' | 'reject' | 'abstain';
    reason?: string;
}

// --- Projects ---

export interface Project {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'completed' | 'archived';
    progress: number;
    tasks: Task[];
    createdAt: string;
    updatedAt: string;
}

export interface Task {
    id: string;
    title: string;
    status: 'todo' | 'in_progress' | 'done' | 'blocked';
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignee?: string;
    dueDate?: string;
}

// --- Notifications ---

export interface Notification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

// --- API Responses ---

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
}
