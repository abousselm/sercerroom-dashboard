const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const Site = require('../models/Site');
const Room = require('../models/Room');
const User = require('../models/User');

// ─── MOTS DANGEREUX ──────────────────────────────────────────────────────────
const MOTS_DANGEREUX = [
  'hack', 'hacker', 'hacking', 'pirate', 'pirater', 'exploit', 'malware',
  'virus', 'ransomware', 'phishing', 'ddos', 'injection', 'sql injection',
  'xss', 'backdoor', 'trojan', 'keylogger', 'rootkit', 'spyware',
  'tuer', 'kill', 'bombe', 'bomb', 'explosion', 'attaque', 'attack',
  'arme', 'weapon', 'terrorisme', 'terrorist',
  'idiot', 'imbecile', 'connard', 'salaud', 'merde', 'putain',
];

const contientMotDangereux = (message) => {
  const texte = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return MOTS_DANGEREUX.find(mot =>
    texte.includes(mot.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  );
};

// ─── CONTEXTE UTILISATEUR ────────────────────────────────────────────────────
const getUserContext = async (userId, userRole) => {
  try {
    if (userRole === 'admin') {
      const [sites, rooms, users] = await Promise.all([
        Site.find({ isActive: true }),
        Room.find({ isActive: true }).populate('site', 'name'),
        User.find({ isActive: true }).select('name email role')
      ]);
      return `Tu es un assistant IA expert pour l'application Server Room Supervision.
L'utilisateur est un ADMIN avec accès complet.
Données du système :
- Sites (${sites.length}) : ${sites.map(s => s.name).join(', ')}
- Salles (${rooms.length}) : ${rooms.map(r => r.name + ' (site: ' + r.site?.name + ')').join(', ')}
- Utilisateurs (${users.length}) : ${users.map(u => u.name + ' (' + u.role + ')').join(', ')}
Réponds en français, de façon concise et professionnelle.`;

    } else if (userRole === 'responsable_site') {
      const site = await Site.findOne({ responsable: userId, isActive: true });
      if (!site) return `Tu es un assistant IA pour Server Room Supervision. L'utilisateur n'a pas de site assigné. Dis-lui de contacter l'admin. Réponds en français.`;

      const rooms = await Room.find({ site: site._id, isActive: true }).populate('authorizedUsers', 'name');
      return `Tu es un assistant IA expert pour l'application Server Room Supervision.
L'utilisateur est RESPONSABLE DU SITE "${site.name}" (${site.location}).
Salles (${rooms.length}) : ${rooms.map(r => r.name + ' - ' + (r.authorizedUsers?.length || 0) + ' utilisateur(s): ' + (r.authorizedUsers?.map(u => u.name).join(', ') || 'aucun')).join(' | ')}
Réponds en français, de façon concise et professionnelle. Utilise ces données pour répondre aux questions.`;

    } else {
      return `Tu es un assistant IA pour Server Room Supervision. L'utilisateur est technicien. Réponds en français.`;
    }
  } catch (err) {
    return `Tu es un assistant IA pour Server Room Supervision. Réponds en français.`;
  }
};

// ─── ROUTE PRINCIPALE ────────────────────────────────────────────────────────
router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { message, history } = req.body;

    // Vérification mots dangereux
    const motDetecte = contientMotDangereux(message);
    if (motDetecte) {
      return res.json({
        reply: `⚠️ **Message dangereux détecté !**\n\nVotre message contient un contenu inapproprié ("${motDetecte}").\n\nCe comportement a été enregistré. Veuillez utiliser cet assistant uniquement pour des questions professionnelles liées à la gestion des salles serveurs.\n\n🔒 Si vous pensez que c'est une erreur, contactez votre administrateur.`,
        dangerous: true
      });
    }

    const systemPrompt = await getUserContext(req.user.id, req.user.role);

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ message: 'GROQ_API_KEY manquant. Ajoutez la clé dans le fichier .env et redémarrez le serveur.' });
    }

    const messages = [
      ...(history || []).slice(-6),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Groq API error:', data);
      return res.status(500).json({ message: 'Erreur API Groq', error: data });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error('Chatbot error:', error.message);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
