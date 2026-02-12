export interface WebhookHandler {
    description: string;
    handler: (payload: Record<string, unknown>) => Promise<unknown>;
}
