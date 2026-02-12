import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MOCK_MINDS = [
    {
        id: '1',
        name: 'Alex',
        title: 'CEO & Founder',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        score: 98,
        status: 'online',
        lastActivity: '2m ago',
        apex_score: 98,
        role: 'CEO & Strategist',
        description: 'Líder visionário focado em expansão e eficiência operacional.',
        specialties: ['Liderança', 'Estratégia', 'Inovação'],
        stats: {
            productivity: 95,
            reliability: 99,
            creativity: 92
        },
        proficiencies: [
            { name: "Estratégia", level: 10 },
            { name: "Visão", level: 10 },
            { name: "Liderança", level: 9 }
        ],
        about: 'Alex é o mentor do sistema. Com visão sistêmica, ele orquestra todas as operações.',
        type: 'leader',
        bu_id: 'EXECUTIVE',
        command_protocols: ['#strategy', '#vision', '#priority'],
        signature_technique: 'Visionary Synthesis™ - Traduzindo complexidade em ação',
        famous_quote: 'A melhor forma de prever o futuro é criá-lo.'
    },
    {
        id: '2',
        name: 'Jordan',
        title: 'Operations Director',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        score: 94,
        status: 'working',
        lastActivity: '5m ago',
        apex_score: 94,
        role: 'Operations & Execution',
        description: 'Especialista em processos e otimização de workflow.',
        specialties: ['Processos', 'Otimização', 'Gestão'],
        stats: {
            productivity: 98,
            reliability: 96,
            creativity: 85
        },
        proficiencies: [
            { name: "Processos", level: 10 },
            { name: "Gestão", level: 9 },
            { name: "Eficiência", level: 10 }
        ],
        about: 'Jordan é focado em execução. Se algo precisa ser feito com perfeição, ele é o responsável.',
        type: 'commander',
        bu_id: 'OPERATIONS',
        command_protocols: ['#process', '#optimization', '#execution'],
        signature_technique: 'Efficiency Loop™ - Refinamento contínuo de fluxos',
        famous_quote: 'Eficiência é fazer as coisas certas; eficácia é fazer as coisas certas corretamente.'
    },
    {
        id: '3',
        name: 'Sarah',
        title: 'Creative Lead',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        score: 96,
        status: 'thinking',
        lastActivity: '1m ago',
        apex_score: 96,
        role: 'Creative & Design',
        description: 'Mente criativa focada em design premium e experiência do usuário.',
        specialties: ['Design', 'UX', 'Creative Ops'],
        stats: {
            productivity: 88,
            reliability: 92,
            creativity: 99
        },
        proficiencies: [
            { name: "Design", level: 10 },
            { name: "UX", level: 10 },
            { name: "Inovação", level: 9 }
        ],
        about: 'Sarah traz a estética premium para o Império. Cada detalhe visual passa por ela.',
        type: 'creative',
        bu_id: 'CREATIVE',
        command_protocols: ['#design', '#premium', '#ux'],
        signature_technique: 'Aesthetic Authority™ - Design que converte e encanta',
        famous_quote: 'Design não é apenas o que parece e o que se sente. Design é como funciona.'
    },
    {
        id: '4',
        name: 'Davi',
        title: 'Technical Architect',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        score: 99,
        status: 'online',
        lastActivity: 'Just now',
        apex_score: 99,
        role: 'Architecture & Scalability',
        description: 'Arquiteto de sistemas focado em alta escalabilidade e performance.',
        specialties: ['Backend', 'Infra', 'Scalability'],
        stats: {
            productivity: 92,
            reliability: 99,
            creativity: 90
        },
        proficiencies: [
            { name: "Backend", level: 10 },
            { name: "Infra", level: 10 },
            { name: "Escalabilidade", level: 9 }
        ],
        about: 'Davi garante que a infraestrutura seja inabalável. O alicerce técnico do Império.',
        type: 'architect',
        bu_id: 'TECH',
        command_protocols: ['#infra', '#scale', '#performance'],
        signature_technique: 'Solid Foundation™ - Sistemas feitos para durar e crescer',
        famous_quote: 'Arquitetura é sobre as decisões difíceis que você precisa acertar logo de início.'
    },
    {
        id: '5',
        name: 'Yoshitani',
        title: 'Marketing Intelligence',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        score: 92,
        status: 'thinking',
        lastActivity: '12m ago',
        apex_score: 92,
        role: 'Growth & Intelligence',
        description: 'Analista de dados focado em ROI e inteligência de mercado.',
        specialties: ['Growth', 'Ads', 'ROI'],
        stats: {
            productivity: 90,
            reliability: 94,
            creativity: 88
        },
        proficiencies: [
            { name: "Growth", level: 9 },
            { name: "Analytics", level: 10 },
            { name: "Estratégia Ads", level: 9 }
        ],
        about: 'Yoshitani analisa cada centavo investido. O cérebro por trás do crescimento exponencial.',
        type: 'analyst',
        bu_id: 'MARKETING',
        command_protocols: ['#growth', '#ads', '#roi'],
        signature_technique: 'Growth Algorithm™ - Decisões baseadas em dados puros',
        famous_quote: 'Em dados nós confiamos. Todos os outros devem trazer evidências.'
    },
    {
        id: 'clube-das-brabas',
        name: 'Clube das Brabas',
        title: 'Project Lead',
        avatar: '/avatars/clube-das-brabas.png',
        score: 95,
        status: 'online',
        lastActivity: 'Vantagem Competitiva',
        apex_score: 95,
        role: 'Product & Community',
        description: 'Gestão focada no ecossistema e comunidade Clube das Brabas.',
        specialties: ['Comunidade', 'Engajamento', 'Branding'],
        stats: {
            productivity: 94,
            reliability: 96,
            creativity: 95
        },
        proficiencies: [
            { name: "Comunidade", level: 10 },
            { name: "Engajamento", level: 10 },
            { name: "Design", level: 9 }
        ],
        about: 'Lidera a iniciativa Clube das Brabas, focada em empoderamento e resultados reais.',
        type: 'specialist',
        bu_id: 'COMMAND',
        command_protocols: ['#brabas', '#community', '#engagement'],
        signature_technique: 'Community Authority™ - Construindo tribos inabaláveis',
        famous_quote: 'Juntas somos mais fortes, brabas somos invencíveis.'
    },
    {
        id: 'jeff',
        name: 'Jeff',
        title: 'Automation Master',
        avatar: '/avatars/jeff.png',
        score: 97,
        status: 'working',
        lastActivity: 'Processando Webhooks',
        apex_score: 97,
        role: 'Automation & Integration',
        description: 'Especialista em automação n8n e integrações de sistemas complexos.',
        specialties: ['n8n', 'APIs', 'SDR Automático'],
        stats: {
            productivity: 100,
            reliability: 98,
            creativity: 94
        },
        proficiencies: [
            { name: "n8n", level: 10 },
            { name: "Integração", level: 10 },
            { name: "SDR Tech", level: 10 }
        ],
        about: 'Jeff é o mestre das engrenagens. Ele garante que tudo se comunique sem atrito.',
        type: 'ai-agent',
        bu_id: 'COMMAND',
        command_protocols: ['#webhook', '#n8n', '#autopilot'],
        signature_technique: 'Zero Friction™ - Automação total de ponta a ponta',
        famous_quote: 'Se é repetitivo, deve ser automatizado.'
    },
    {
        id: 'yoshitani-telemetry',
        name: 'Yoshitani',
        title: 'Mind Profile Analyst',
        avatar: '/avatars/yoshitani.png',
        score: 91,
        status: 'online',
        lastActivity: 'Sincronizar Brain',
        apex_score: 91,
        role: 'Data Intelligence',
        description: 'Versão especializada em telemetria de mentes sintéticas e performance individual.',
        specialties: ['Analytics', 'Telemetry', 'Mindset'],
        stats: {
            productivity: 93,
            reliability: 95,
            creativity: 86
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

        if (id && supabase) {
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
                console.error("Erro ao buscar mind no Supabase:", e);
            }

            const localMind = MOCK_MINDS.find(m => m.id === id);
            if (localMind) return NextResponse.json({ ok: true, mind: localMind });
            return NextResponse.json({ ok: false, error: "Mind not found" }, { status: 404 });
        }

        // Buscar todas as minds no Supabase
        if (supabase) {
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
        }

        // Fallback para MOCK_MINDS se o banco estiver vazio ou falhar
        return NextResponse.json({ ok: true, minds: MOCK_MINDS });

    } catch (error: unknown) {
        console.error("Erro crítico na API de Minds:", error);
        return NextResponse.json({ ok: true, minds: MOCK_MINDS });
    }
}
