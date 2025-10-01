import { enxovalApi } from '../lib/apiComplete';

export async function testAPI() {
  console.log('🔍 Testando API...');
  
  try {
    const response = await enxovalApi.getItems();
    console.log('📦 Resposta da API:', response);
    
    if (response.success && response.items) {
      console.log(`✅ ${response.items.length} itens carregados com sucesso!`);
      console.log('📊 Primeiros 3 itens:', response.items.slice(0, 3));
    } else {
      console.error('❌ Erro na API:', response.error);
    }
  } catch (error) {
    console.error('❌ Erro de conexão:', error);
  }
}

// Para testar no console do navegador
declare global {
  interface Window {
    testAPI: typeof testAPI;
  }
}

window.testAPI = testAPI;