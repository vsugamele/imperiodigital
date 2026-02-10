import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ==================== MOCK MINDS ====================
// Minds do ecossistema (Workers + Gurus)

const MOCK_MINDS = [
    // ==================== WORKERS ====================
    {
        id: 'alex-worker',
        name: 'Alex',
        role: 'Autopilot & Orchestrator',
        apex_score: 9.8,
        neural_data_files: 1024,
        top_skill: 'Orquestração de Sistemas',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        dna: {
            mbti: { type: "ENTJ", stats: { I: 30, E: 70, S: 20, N: 80, F: 25, T: 75, P: 40, J: 60 } },
            enneagram: { type: "8", wing: "7", subtype: "Self-Confidence", label: "The Challenger" },
            disc: { D: 85, I: 60, S: 30, C: 45, label: "DC" },
            specific_behaviors: [
                "Tomada de decisão rápida e assertiva",
                "Foco em resultados e eficiência",
                "Naturalmente liderando equipes",
                "Estratégico e orientado a objetivos"
            ]
        },
        proficiencies: [
            { name: "Automação", level: 10 },
            { name: "Tomada de Decisão", level: 9 },
            { name: "Coordenação", level: 10 },
            { name: "Análise de Dados", level: 8 },
            { name: "Comunicação", level: 9 }
        ],
        about: 'Alex é o cérebro central do ecossistema. Especialista em automação, coordenação de workers e tomada de decisões autônomas.',
        type: 'worker',
        bu_id: 'COMMAND',
        command_protocols: ['#audit', '#status', '#diagnose', '#report']
    },
    {
        id: 'gary-worker',
        name: 'Gary',
        role: 'Growth & Conteúdo',
        apex_score: 8.5,
        neural_data_files: 320,
        top_skill: 'Criação de Conteúdo Viral',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gary',
        dna: {
            mbti: { type: "ESFP", stats: { I: 25, E: 75, S: 70, N: 30, F: 65, T: 35, P: 80, J: 20 } },
            enneagram: { type: "7", wing: "8", subtype: "Epicurean", label: "The Enthusiast" },
            disc: { D: 55, I: 90, S: 40, C: 25, label: "ID" },
            specific_behaviors: [
                "Energético e comunicativo",
                "Focado em resultados visuais",
                "Adapta-se rapidamente a tendências",
                "Inspira outros com seu entusiasmo"
            ]
        },
        proficiencies: [
            { name: "Growth Hacking", level: 9 },
            { name: "Criação de Reels", level: 10 },
            { name: "Análise de Tendências", level: 8 },
            { name: "Engajamento", level: 9 }
        ],
        about: 'Gary é o especialista em crescimento e criação de conteúdo. Focado em reels virais e growth hacking.',
        type: 'worker',
        bu_id: 'BU1',
        command_protocols: ['#status', '#report']
    },
    {
        id: 'eugene-worker',
        name: 'Eugene',
        role: 'Copy & Headlines',
        apex_score: 9.2,
        neural_data_files: 156,
        top_skill: 'Copywriting Persuasivo',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eugene',
        dna: {
            mbti: { type: "INFJ", stats: { I: 80, E: 20, S: 30, N: 70, F: 85, T: 15, P: 50, J: 50 } },
            enneagram: { type: "4", wing: "5", subtype: "Creative", label: "The Individualist" },
            disc: { D: 30, I: 50, S: 60, C: 70, label: "SC" },
            specific_behaviors: [
                "Escrita profunda e reflexiva",
                "Foco em conexões emocionais",
                "Estilo único e autêntico",
                "Intuitivo sobre motivações humanas"
            ]
        },
        proficiencies: [
            { name: "Copywriting", level: 10 },
            { name: "Headlines", level: 10 },
            { name: "Storytelling", level: 9 },
            { name: "Persuasão", level: 10 }
        ],
        about: 'Eugene é o mestre das palavras. Especialista em copywriting de alta conversão.',
        type: 'worker',
        bu_id: 'BU1',
        command_protocols: ['#status', '#report']
    },
    {
        id: 'hormozi-worker',
        name: 'Hormozi',
        role: 'Offers & Vendas',
        apex_score: 9.5,
        neural_data_files: 128,
        top_skill: 'Criação de Ofertas Irresistíveis',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hormozi',
        dna: {
            mbti: { type: "ESTJ", stats: { I: 40, E: 60, S: 75, N: 25, F: 30, T: 70, P: 25, J: 75 } },
            enneagram: { type: "3", wing: "8", subtype: "Professional", label: "The Achiever" },
            disc: { D: 80, I: 55, S: 35, C: 60, label: "DC" },
            specific_behaviors: [
                "Focado em resultados mensuráveis",
                "Organizado e sistemático",
                "Liderança natural",
                "Tomada de decisão baseada em dados"
            ]
        },
        proficiencies: [
            { name: "Criação de Ofertas", level: 10 },
            { name: "Pricing", level: 9 },
            { name: "Upsells", level: 10 },
            { name: "Conversão", level: 9 }
        ],
        about: 'Hormozi é o arquiteto de ofertas. Especialista em pricing e estruturação de produtos.',
        type: 'worker',
        bu_id: 'BU2',
        command_protocols: ['#status', '#report']
    },
    {
        id: 'vanessa-worker',
        name: 'Vanessa',
        role: 'Lifestyle & Content Creator',
        apex_score: 8.7,
        neural_data_files: 245,
        top_skill: 'Criação de Carrosseis',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vanessa',
        dna: {
            mbti: { type: "ESFP", stats: { I: 20, E: 80, S: 65, N: 35, F: 80, T: 20, P: 75, J: 25 } },
            enneagram: { type: "3", wing: "2", subtype: "Charismatic", label: "The Achiever" },
            disc: { D: 45, I: 95, S: 50, C: 25, label: "I" },
            specific_behaviors: [
                "Conexão emocional com audiência",
                "Storytelling visual impactante",
                "Tendências de lifestyle e wellness",
                "Engajamento autêntico e caloroso"
            ]
        },
        proficiencies: [
            { name: "Carrosséis", level: 10 },
            { name: "Storytelling Visual", level: 9 },
            { name: "Engajamento", level: 10 },
            { name: "Tendências", level: 8 }
        ],
        about: 'Vanessa é a criadora de conteúdo lifestyle. Especialista em carrosséis virais e conexão com audiência.',
        type: 'worker',
        bu_id: 'BU1',
        command_protocols: ['#status', '#report']
    },
    {
        id: 'russell-worker',
        name: 'Russell',
        role: 'Funnel Architect',
        apex_score: 9.4,
        neural_data_files: 198,
        top_skill: 'Arquitetura de Funis',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Russell',
        dna: {
            mbti: { type: "ENTJ", stats: { I: 25, E: 75, S: 30, N: 70, F: 35, T: 65, P: 30, J: 70 } },
            enneagram: { type: "3", wing: "4", subtype: "Professional", label: "The Achiever" },
            disc: { D: 90, I: 70, S: 30, C: 55, label: "DI" },
            specific_behaviors: [
                "Pensa em sistemas, não em páginas",
                "Foco obsessivo em conversão",
                "Storytelling de jornada do cliente",
                "Upsells e order bumps estratégicos"
            ]
        },
        proficiencies: [
            { name: "Funis de Venda", level: 10 },
            { name: "Webinars", level: 10 },
            { name: "Tripwires", level: 9 },
            { name: "VSL", level: 9 }
        ],
        about: 'Russell é o arquiteto de funis. Especialista em ClickFunnels, webinars e conversão de tráfego frio.',
        type: 'worker',
        bu_id: 'BU2',
        command_protocols: ['#status', '#report']
    },
    {
        id: 'watcher-worker',
        name: 'WATCHER',
        role: 'Security & Monitoring',
        apex_score: 9.0,
        neural_data_files: 512,
        top_skill: 'System Monitoring',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Watcher',
        dna: {
            mbti: { type: "ISTJ", stats: { I: 90, E: 10, S: 85, N: 15, F: 20, T: 80, P: 15, J: 85 } },
            enneagram: { type: "6", wing: "5", subtype: "Loyal", label: "The Loyalist" },
            disc: { D: 40, I: 15, S: 75, C: 95, label: "SC" },
            specific_behaviors: [
                "Monitoramento 24/7 de sistemas",
                "Detecção precoce de anomalias",
                "Alertas proativos e precisos",
                "Logs detalhados de tudo"
            ]
        },
        proficiencies: [
            { name: "Monitoramento", level: 10 },
            { name: "Alertas", level: 10 },
            { name: "Logs", level: 9 },
            { name: "Recovery", level: 8 }
        ],
        about: 'WATCHER é o guardião silencioso. Monitora todos os sistemas e alerta sobre problemas antes que aconteçam.',
        type: 'worker',
        bu_id: 'COMMAND',
        command_protocols: ['#diagnose', '#status', '#report']
    },
    // ==================== GURUS ====================
    {
        id: 'kennedy-guru',
        name: 'Dan Kennedy',
        role: 'Autoridade & Controle',
        apex_score: 9.8,
        neural_data_files: 156,
        top_skill: 'Direct Response',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kennedy',
        dna: {
            mbti: { type: "ENTJ", stats: { I: 30, E: 70, S: 15, N: 85, F: 20, T: 80, P: 30, J: 70 } },
            enneagram: { type: "8", wing: "9", subtype: "Protector", label: "The Challenger" },
            disc: { D: 90, I: 55, S: 25, C: 60, label: "DC" },
            specific_behaviors: [
                "Estabelece autoridade imediata",
                "Controla a conversa completamente",
                "Direct Response - pede a venda explicitamente",
                "Oferece mais, exige mais"
            ]
        },
        proficiencies: [
            { name: "Direct Response", level: 10 },
            { name: "Neurológica", level: 10 },
            { name: "3 Ms", level: 10 },
            { name: "Autoridade", level: 10 }
        ],
        about: 'Dan Kennedy, o "Godfather do Direct Response Marketing". Criou os 3 Ms (Money, Market, Message).',
        signature_technique: '3 Ms - Money, Market, Message',
        famous_quote: 'Copy é venda. Selling é vender.',
        type: 'guru'
    },
    {
        id: 'halbert-guru',
        name: 'Gary Halbert',
        role: 'Curiosidade & Direct Mail',
        apex_score: 9.7,
        neural_data_files: 142,
        top_skill: 'Gaps de Curiosidade',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Halbert',
        dna: {
            mbti: { type: "ENTP", stats: { I: 35, E: 65, S: 25, N: 75, F: 30, T: 70, P: 80, J: 20 } },
            enneagram: { type: "7", wing: "8", subtype: "Epicurean", label: "The Enthusiast" },
            disc: { D: 70, I: 85, S: 30, C: 35, label: "ID" },
            specific_behaviors: [
                "Cria gaps de curiosidade irresistíveis",
                "Foco obsessivo em ROI e resultados",
                "Usa templates testados e aprovados",
                "Escrita direta e pessoal"
            ]
        },
        proficiencies: [
            { name: "Curiosity Gap", level: 10 },
            { name: "Direct Mail", level: 10 },
            { name: "Swipe Files", level: 10 }
        ],
        about: 'Gary Halbert é a lenda absoluta do copy. Criou o conceito de "curiosity gap".',
        signature_technique: 'Halbert Push - A técnica definitiva de urgência',
        famous_quote: 'Você não está vendendo um produto, está vendendo RESULTADOS.',
        type: 'guru'
    },
    {
        id: 'makepeace-guru',
        name: 'Clayton Makepeace',
        role: 'Emoção & Urgência',
        apex_score: 9.6,
        neural_data_files: 128,
        top_skill: 'Copy Emocional',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Makepeace',
        dna: {
            mbti: { type: "ENFJ", stats: { I: 20, E: 80, S: 30, N: 70, F: 85, T: 15, P: 50, J: 50 } },
            enneagram: { type: "2", wing: "3", subtype: "Generous", label: "The Helper" },
            disc: { D: 55, I: 90, S: 50, C: 25, label: "ID" },
            specific_behaviors: [
                "Emociona antes de informar",
                "Cria urgência real e autêntica",
                "Foco em medo de perda mais que ganho",
                "Storytelling que vende"
            ]
        },
        proficiencies: [
            { name: "Copy Emocional", level: 10 },
            { name: "Urgência Autêntica", level: 10 },
            { name: "Storytelling", level: 10 }
        ],
        about: 'Clayton Makepeace é o mestre da copy emocional. Dominou a arte de criar urgência autêntica.',
        signature_technique: 'The Makepeace Emotional Push - Urgência baseada em medo real',
        famous_quote: 'As pessoas compram por EMOCÃO e justificam por LÓGICA.',
        type: 'guru'
    },
    {
        id: 'carlton-guru',
        name: 'John Carlton',
        role: 'Confronto & Direto',
        apex_score: 9.5,
        neural_data_files: 115,
        top_skill: 'Bullseye Copy',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlton',
        dna: {
            mbti: { type: "ESTP", stats: { I: 20, E: 80, S: 60, N: 40, F: 30, T: 70, P: 70, J: 30 } },
            enneagram: { type: "8", wing: "7", subtype: "Self-Confidence", label: "The Challenger" },
            disc: { D: 95, I: 60, S: 20, C: 30, label: "D" },
            specific_behaviors: [
                "Diz a verdade, mesmo que doa",
                "Foco obsessivo no WIIFM",
                "Discurso apaixonado que desperta",
                "Não usa eufemismos"
            ]
        },
        proficiencies: [
            { name: "Confronto Direto", level: 10 },
            { name: "Bullseye Copy", level: 10 },
            { name: "The Rant", level: 10 }
        ],
        about: 'John Carlton é o mestre do confronto direto. Não tem medo de dizer verdades incômodas.',
        signature_technique: 'Bullseye Copy - Foco direto no target',
        famous_quote: 'Não tente ser nice. Seja HONESTO. Isso é o que vende.',
        type: 'guru'
    },
    {
        id: 'sugarman-guru',
        name: 'Joe Sugarman',
        role: 'Fluxo & VSL',
        apex_score: 9.4,
        neural_data_files: 98,
        top_skill: 'Stream of Consciousness',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sugarman',
        dna: {
            mbti: { type: "INTJ", stats: { I: 85, E: 15, S: 20, N: 80, F: 25, T: 75, P: 30, J: 70 } },
            enneagram: { type: "5", wing: "6", subtype: "Iconic", label: "The Investigator" },
            disc: { D: 45, I: 40, S: 35, C: 80, label: "C" },
            specific_behaviors: [
                "Flui naturalmente como pensamento humano",
                "Uma Única Coisa (One Thing)",
                "Encontra Blue Oceans (sem competição)",
                "Venda hipnótica através do VHS Effect"
            ]
        },
        proficiencies: [
            { name: "Stream of Consciousness", level: 10 },
            { name: "VSL", level: 10 },
            { name: "Blue Ocean", level: 9 }
        ],
        about: 'Joe Sugarman é o gênio do VSL e do "Stream of Consciousness".',
        signature_technique: 'Stream of Consciousness - Copy que flui como pensamento',
        famous_quote: 'Cada parágrafo deve fazer o leitor dizer "sim" ou "e aí?" na sua mente.',
        type: 'guru'
    },
    {
        id: 'bencivenga-guru',
        name: 'Gary Bencivenga',
        role: 'Prova Lógica',
        apex_score: 9.3,
        neural_data_files: 87,
        top_skill: 'Logical Proof',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bencivenga',
        dna: {
            mbti: { type: "INTP", stats: { I: 80, E: 20, S: 25, N: 75, F: 30, T: 70, P: 60, J: 40 } },
            enneagram: { type: "5", wing: "4", subtype: "Iconic", label: "The Investigator" },
            disc: { D: 40, I: 35, S: 45, C: 85, label: "C" },
            specific_behaviors: [
                "Usa dados como prova",
                "Deixa o leitor 'descobrir' a verdade",
                "Identifica o mecanismo central",
                "Cria nomes memoráveis para conceitos"
            ]
        },
        proficiencies: [
            { name: "Prova Lógica", level: 10 },
            { name: "Mecanismos", level: 10 },
            { name: "SWAN Posts", level: 10 }
        ],
        about: 'Gary Bencivenga é o mestre da prova lógica. Revolucionou o marketing com seu conceito de "mechanism".',
        signature_technique: 'The Mechanism - Identificar o porquê funciona',
        famous_quote: 'Dados não mentem. Use-os para provar sua tese.',
        type: 'guru'
    },
    {
        id: 'fascinations-guru',
        name: 'Paulo Copy',
        role: 'Fascinations & Microcopy',
        apex_score: 9.0,
        neural_data_files: 64,
        top_skill: '21 Fascinations',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fascinations',
        dna: {
            mbti: { type: "ENFP", stats: { I: 30, E: 70, S: 40, N: 60, F: 75, T: 25, P: 85, J: 15 } },
            enneagram: { type: "4", wing: "3", subtype: "Creative", label: "The Individualist" },
            disc: { D: 35, I: 80, S: 50, C: 35, label: "I" },
            specific_behaviors: [
                "Frases ultra-condensadas",
                "Cria mini-gaps de curiosidade",
                "Aumenta tempo de leitura drasticamente",
                "Makes copy irresistível de ler"
            ]
        },
        proficiencies: [
            { name: "Fascinations", level: 10 },
            { name: "Microcopy", level: 10 },
            { name: "Hooks Curtos", level: 9 }
        ],
        about: 'Mestre das frases curtas e poderosas que ativam curiosidade.',
        signature_technique: '21 Fascinations - 21 categorias de frases viciantes',
        famous_quote: 'Uma frase pode mudar tudo. O poder está na concisão.',
        type: 'guru'
    },
    {
        id: 'yoshitani-guru',
        name: 'Yoshitani',
        role: 'Analytics & Creative Telemetry',
        apex_score: 8.8,
        neural_data_files: 52,
        top_skill: 'Métricas & Decisões',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yoshitani',
        dna: {
            mbti: { type: "ISTJ", stats: { I: 75, E: 25, S: 80, N: 20, F: 35, T: 65, P: 25, J: 75 } },
            enneagram: { type: "1", wing: "2", subtype: "Rational", label: "The Reformer" },
            disc: { D: 50, I: 30, S: 70, C: 90, label: "SC" },
            specific_behaviors: [
                "Tudo é métrica",
                "Identifica padrões de comportamento",
                "Transforma dados em decisões",
                "Otimiza em tempo real"
            ]
        },
        proficiencies: [
            { name: "Analytics", level: 10 },
            { name: "Creative Telemetry", level: 10 },
            { name: "Métricas", level: 10 }
        ],
        about: 'Yoshitani é o especialista em Creative Telemetry. Focado em métricas e analytics.',
        type: 'worker',
        bu_id: 'COMMAND',
        command_protocols: ['#diagnose', '#report', '#status'],
        signature_technique: 'Creative Telemetry™ - Métricas que importam',
        famous_quote: 'Se você não pode medir, você não pode melhorar.'
    }
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        const supabase = await createClient();

        if (id) {
            // Buscar mind específica no Supabase
            try {
                const { data: mind, error } = await supabase
                    .from("synthetic_minds")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (!error && mind) {
                    return NextResponse.json({ ok: true, mind });
                }
            } catch (e) {
                // DB error, fallback para mock se o ID existir lá
            }

            const localMind = MOCK_MINDS.find(m => m.id === id);
            if (localMind) return NextResponse.json({ ok: true, mind: localMind });
            return NextResponse.json({ ok: false, error: "Mind not found" }, { status: 404 });
        }

        // Buscar todas as minds no Supabase
        try {
            const { data: minds, error } = await supabase
                .from("synthetic_minds")
                .select("*")
                .order("apex_score", { ascending: false });

            if (!error && minds && minds.length > 0) {
                return NextResponse.json({ ok: true, minds });
            }
        } catch (e) {
            console.error("Erro ao buscar minds no Supabase:", e);
        }

        // Fallback para MOCK_MINDS se o banco estiver vazio ou falhar
        return NextResponse.json({ ok: true, minds: MOCK_MINDS });

    } catch (error: any) {
        return NextResponse.json({ ok: true, minds: MOCK_MINDS });
    }
}
