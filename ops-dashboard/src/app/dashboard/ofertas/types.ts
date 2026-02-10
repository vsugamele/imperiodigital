// Type definitions for Ofertas components
export interface Oferta {
    nome: string;
    safeName: string;
    ideia?: string;
    status: {
        fase: number;
        progresso: string;
        proximo: string;
        executando?: boolean;
        mensagem?: string;
        erro?: string;
        logs?: { data: string; msg: string }[];
        hipoteseVencedora?: string;
        imperiusInsight?: {
            data: string;
            insight: string;
            acaoSugerida: string;
            prioridade: 'Alta' | 'Média' | 'Baixa';
        };
        mindCritics?: {
            score: number;
            arquivo: string;
        };
    };
    fases: Record<string, FaseData>;
    createdAt: string;
    updatedAt?: string;
    metricas?: {
        doresIdentificadas?: number;
        headlinesCriadas?: number;
        bonusEstrategicos?: number;
        metodosMapeados?: number;
        bulasEmocionais?: number;
    };
    vantagens?: string[];
    proximoLancamento?: {
        fase: string;
        data: string;
        acao: string;
    };
}

export interface FaseData {
    status: string;
    completo: boolean;
    dataCompleto?: string | null;
    arquivo?: string;
    avatar?: {
        nome: string;
        idade: number;
        profissao: string;
        dorPrincipal: string;
        medoPrincipal: string;
    };
    gap?: string;
    mecanismo?: {
        nome: string;
        duracao: string;
        insight: string;
        passos: string[];
    };
    oferta?: {
        lowticket: { nome: string; preco: number };
        midticket: { nome: string; preco: number; valorTotal?: number; desconto?: string };
        highticket: { nome: string; preco: number };
    };
    copy?: {
        headlines: number;
        topHeadlines?: string[];
        vsl?: { duracao: string; status: string };
    };
    hipoteses?: Array<{
        letra: string;
        nome: string;
        angle: string;
        precoMid: number;
        precoHigh: number;
        status: string;
        justificativa?: string;
    }>;
    testesPlanejados?: Array<{
        tipo: string;
        plataforma: string;
        orcamento?: string;
        duracao?: string;
        variacoes?: string[];
    }>;
}

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

export type OfertasTabType = 'overview' | 'fases' | 'hackerverso' | 'logs' | 'config';
