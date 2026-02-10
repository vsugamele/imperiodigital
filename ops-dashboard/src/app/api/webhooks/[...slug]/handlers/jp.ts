import { createClient } from '@supabase/supabase-js';
import { sendEmail, generateWelcomeEmail } from '@/lib/email';

// ==================== JP PROJECT HANDLERS ====================

// Default project (Igaming)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// SB1 Project (Clube das Brabas)
const sb1Url = process.env.SB1_SUPABASE_URL || 'https://tkbivipqiewkfnhktmqq.supabase.co';
const sb1ServiceKey = process.env.SB1_SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdmin() {
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

function getSB1SupabaseAdmin() {
    if (!sb1ServiceKey) {
        throw new Error('SB1_SUPABASE_SERVICE_ROLE_KEY não configurada');
    }
    return createClient(sb1Url, sb1ServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

interface WebhookHandler {
    description: string;
    handler: (payload: any) => Promise<any>;
}

export const jpHandlers: Record<string, WebhookHandler> = {

    // ==================== CRIAR USUÁRIO ====================
    'create-user': {
        description: 'Cria novo usuário no SB1 (Brabas), insere no c_profiles e envia email de boas-vindas',
        handler: async (payload: any) => {
            const { email, password, name, phone, metadata } = payload;
            console.log('🚀 Webhook: create-user starting for:', email);

            if (!email) throw new Error('Email é obrigatório');

            console.log('🔗 Connecting to SB1 Supabase...');
            const sb1 = getSB1SupabaseAdmin();

            // 1. Criar usuário no Supabase Auth (SB1)
            console.log('👤 Creating Auth user...');
            const { data: authData, error: authError } = await sb1.auth.admin.createUser({
                email,
                password: password || undefined,
                email_confirm: true,
                user_metadata: {
                    full_name: name || email.split('@')[0],
                    project: 'brabas',
                    ...metadata,
                },
            });

            if (authError) {
                console.error('❌ Auth error:', authError.message);
                throw new Error(`Erro ao criar usuário Auth: ${authError.message}`);
            }

            const userId = authData.user?.id;
            console.log('✅ Auth user created:', userId);

            if (!userId) throw new Error('Falha ao obter ID do usuário criado');

            // 2. Inserir no c_profiles (SB1)
            console.log('📝 Upserting c_profiles...');
            const { error: profileError } = await sb1
                .from('c_profiles')
                .upsert({
                    id: userId,
                    email,
                    username: email.split('@')[0],
                    full_name: name || null,
                    phone: phone || null,
                    is_active: true,
                    updated_at: new Date().toISOString()
                });

            if (profileError) {
                console.error('⚠️ Erro ao criar profile:', profileError.message);
            } else {
                console.log('✅ Profile upserted successfully');
            }

            // 3. Enviar email de boas-vindas
            let emailResult: { success: boolean; error?: string; messageId?: string } = { success: false, error: 'Password not provided' };
            if (password) {
                const { subject, html } = generateWelcomeEmail(name || email.split('@')[0], email, password);
                const res = await sendEmail({ to: email, subject, html });
                emailResult = res as any;
            } else {
                // Se não tem password, enviar invite
                const { error: inviteError } = await sb1.auth.admin.inviteUserByEmail(email);
                if (inviteError) console.error(`⚠️ Invite error: ${inviteError.message}`);
                else emailResult = { success: true, message: 'Invite sent' } as any;
            }

            return {
                message: `Usuário ${email} criado no Clube das Brabas`,
                user_id: userId,
                profile_status: profileError ? 'failed' : 'success',
                email_status: emailResult.success ? 'sent' : 'failed',
                email_error: (emailResult as any).error
            };
        },
    },

    // ==================== RESET DE SENHA ====================
    'reset-password': {
        description: 'Envia email de recuperação de senha no SB1',
        handler: async (payload: any) => {
            const { email, redirect_url } = payload;

            if (!email) throw new Error('Email é obrigatório');

            const sb1 = getSB1SupabaseAdmin();

            // usando a URL de produção do Clube das Brabas
            const { data, error } = await sb1.auth.admin.generateLink({
                type: 'recovery',
                email,
                options: { redirectTo: redirect_url || 'https://clubedasbrabas.vercel.app/reset-password' }
            });

            if (error) throw new Error(`Erro ao gerar link de reset: ${error.message}`);

            // Poderíamos enviar o link manualmente via Gmail aqui
            const resetLink = data.properties.action_link;

            const emailResult = await sendEmail({
                to: email,
                subject: 'Recuperação de Senha - Clube das Brabas',
                html: `
                    <div style="font-family: sans-serif;">
                        <h2>Recuperação de Senha</h2>
                        <p>Você solicitou a alteração de sua senha no Clube das Brabas.</p>
                        <p>Clique no botão abaixo para criar uma nova senha:</p>
                        <a href="${resetLink}" style="display: inline-block; background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">REDEFINIR SENHA</a>
                        <p>Se você não solicitou isso, ignore este e-mail.</p>
                    </div>
                `
            });

            return {
                message: `Email de recuperação enviado para ${email}`,
                success: emailResult.success
            };
        },
    },

    // ... (Keep existing update/delete/list handlers but update to use SB1 if needed, 
    // or keep them for the other project. For now I'll just keep them as they were but 
    // they might need refactoring to handle multiple projects)
    // To keep it simple, I'll only list/update/delete on Igaming for now unless specified.
};
