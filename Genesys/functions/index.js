const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");

initializeApp();



exports.processarAssinaturaGenesys = onCall({ cors: true }, async (request) => {
    const { planId } = request.data;
    
    // Tabela de preços que o usuário NÃO CONSEGUE mexer
    const PRECOS = { 'monthly': 0.0, 'yearly': 19.90 };
    const valor = PRECOS[planId];

    if (valor === undefined) throw new HttpsError('not-found', 'Plano inexistente.');

    // Aqui você retornaria o link do Mercado Pago
    return { success: true, valorCobrado: valor };
});