const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

// Configuração do Cliente usando a chave protegida no .env
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});
xports.webhookMercadoPago = onRequest(async (req, res) => {
    // 1. O Mercado Pago envia o ID do pagamento no corpo ou na query
    const paymentId = req.query['data.id'] || req.body.data?.id;

    if (paymentId) {
        try {
            const payment = new Payment(client);
            const result = await payment.get({ id: paymentId });

            // 2. Verificamos se o status é 'approved'
            if (result.status === 'approved') {
                const uid = result.external_reference; // Lembra que passamos o UID no checkout?
                const db = getFirestore();

                // 3. ATUALIZAÇÃO DE ELITE: Liberamos o Rank S no Firestore
                await db.collection("users").doc(uid).update({
                    statusPagamento: 'ativo',
                    rank: 'Rank S (Lendário)',
                    moedas: admin.firestore.FieldValue.increment(500) // Bônus de boas-vindas!
                });

                console.log(`Poder concedido ao usuário: ${uid}`);
            }
        } catch (error) {
            console.error("Erro ao processar Webhook:", error);
        }
    }

    // O Mercado Pago exige que você responda 200 OK rápido
    res.status(200).send("OK");
});
exports.processarAssinaturaGenesys = onCall({ cors: true }, async (request) => {
    const { planId } = request.data;
    const uid = request.auth?.uid;

    // Proteção: Só logados podem gerar pagamento
    if (!uid) {
        throw new HttpsError('unauthenticated', 'Você precisa estar logado.');
    }

    const PRECOS = {
        'monthly': { nome: 'Iniciado', preco: 0.01 }, // Use 0.01 para testes reais
        'yearly': { nome: 'Lendário', preco: 19.90 }
    };

    const plano = PRECOS[planId];
    if (!plano) throw new HttpsError('not-found', 'Plano inexistente.');

    try {
        const preference = new Preference(client);

        const response = await preference.create({
            body: {
                items: [
                    {
                        id: planId,
                        title: `Sistema Genesys: Plano ${plano.nome}`,
                        quantity: 1,
                        unit_price: plano.preco,
                        currency_id: 'BRL'
                    }
                ],
                // Identificamos quem está pagando para liberar o Rank S depois
                external_reference: uid,
                back_urls: {
                    success: "https://barbersys.xyz/pagamento-sucesso",
                    failure: "https://barbersys.xyz/pagamento-erro",
                },
                auto_return: "approved",
            }
        });

        // Retornamos o link de pagamento (init_point) para o App
        return {
            success: true,
            checkoutUrl: response.init_point
        };

    } catch (error) {
        console.error("Erro Mercado Pago:", error);
        throw new HttpsError('internal', 'Erro ao gerar preferência de pagamento.');
    }
});