import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const niche = searchParams.get('niche') || 'ecommerce';
  const platform = searchParams.get('platform') || 'instagram';
  
  // Mock - depois buscar do Supabase
  const templates = [
    {
      id: '1',
      name: 'Promoção Urgente',
      prompt_template: 'Crie um post para {{produto}} com tom urgente',
      example_copy: '🔥 OFERTA LIMITADA! 🔥\n\n50% OFF\n\n⏰ Só hoje!'
    },
    {
      id: '2',
      name: 'Prova Social',
      prompt_template: 'Crie um post com prova social sobre {{topico}}',
      example_copy: '⭐️ 10.000 clientes satisfeitos!\n\nVeja os resultados...'
    }
  ];
  
  return NextResponse.json(templates);
}
