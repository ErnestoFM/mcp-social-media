// webhook-server.ts
import express from 'express';
import crypto from 'crypto';

const app = express();
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET!;
const VERIFY_TOKEN = '999999999'; // Crea uno aleatorio

app.use(express.json());

// Verificación del webhook (requerido por Meta)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Recibir notificaciones
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  
  // Verificar que venga de Instagram
  if (!verifySignature(req.body, signature)) {
    return res.sendStatus(403);
  }

  const body = req.body;
  
  // Procesar el evento
  if (body.object === 'instagram') {
    body.entry.forEach((entry: any) => {
      entry.changes.forEach((change: any) => {
        console.log('📩 Nuevo evento:', change);
        
        // Aquí procesarías el evento
        if (change.field === 'comments') {
          console.log('💬 Nuevo comentario!');
          // Responder automáticamente, etc.
        }
      });
    });
  }

  res.sendStatus(200);
});

function verifySignature(payload: any, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', APP_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}

app.listen(3000, () => {
  console.log('🎣 Servidor de Webhooks escuchando en puerto 3000');
}); 