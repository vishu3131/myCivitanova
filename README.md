# Civitanova Marche App

Un'applicazione web moderna per la città di Civitanova Marche, sviluppata con Next.js e React.

## 🌟 Caratteristiche

- **Design Responsive**: Ottimizzata per dispositivi mobili e desktop
- **Gamificazione**: Sistema di punti XP e badge per coinvolgere gli utenti
- **Widget Meteo**: Informazioni meteorologiche in tempo reale
- **Community**: Forum e sistema di eventi per la comunità locale
- **AR Experience**: Anteprima di esperienze in realtà aumentata
- **Quick Actions**: Accesso rapido ai servizi più utilizzati

## 🛠️ Tecnologie Utilizzate

- **Framework**: Next.js 13.4.12
- **Frontend**: React 18.2.0 con TypeScript
- **Styling**: Tailwind CSS 3.3.3
- **Icons**: Lucide React
- **Database**: Firebase (Authentication + Firestore)

## 🚀 Installazione e Avvio

1. Clona il repository:
```bash
git clone https://github.com/[tuo-username]/civitanova-marche-app.git
cd civitanova-marche-app
```

2. Installa le dipendenze:
```bash
npm install
```

3. Configura le variabili d'ambiente:
```bash
cp .env.example .env.local
# Modifica .env.local con le tue credenziali Firebase
```

4. Avvia il server di sviluppo:
```bash
npm run dev
```

5. Apri [http://localhost:3000](http://localhost:3000) nel tuo browser.

## 📱 Componenti Principali

- **Header**: Navigazione principale
- **BottomNav**: Barra di navigazione mobile
- **HeroSection**: Sezione hero della homepage
- **WeatherWidget**: Widget meteo con informazioni locali
- **GamificationWidget**: Sistema di gamificazione
- **QuickActions**: Azioni rapide per i servizi
- **CommunityForum**: Forum della comunità

## 🎯 Scripts Disponibili

```bash
npm run dev          # Avvia il server di sviluppo
npm run build        # Crea la build di produzione
npm run start        # Avvia il server di produzione
npm run lint         # Esegue il linting del codice
```

## 🌐 Deploy

L'applicazione è ottimizzata per il deploy su:
- **Vercel** (consigliato per Next.js)
- **Netlify**
- **Railway**
- **Heroku**

### 🚀 Configurazione per Produzione

1. **Configurazione Ambiente**:
   ```bash
   # Copia il file di configurazione di produzione
   cp .env.production.example .env.production
   # Modifica .env.production con le credenziali Firebase di produzione
   ```

2. **Build di Produzione**:
   ```bash
   # Crea la build ottimizzata per produzione
   npm run build
   # Avvia il server di produzione
   npm run start
   ```

3. **Creazione Utente Admin**:
   ```bash
   # Esegui lo script per creare l'utente amministratore
   node create-production-admin.js
   ```
   Lo script è interattivo e ti guiderà nella creazione di un utente admin sicuro.

4. **Verifica Configurazione**:
   - Assicurati che `NODE_ENV` sia impostato su `production`
   - Verifica che tutte le variabili Firebase siano configurate correttamente
   - Controlla che i dati mock siano disabilitati in produzione

## 📄 Licenza

Questo progetto è sotto licenza MIT - vedi il file [LICENSE](LICENSE) per i dettagli.

## 🤝 Contributi

I contributi sono benvenuti! Per favore:
1. Fai un fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Committa le tue modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Pusha sul branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📞 Contatti

Per domande o supporto, contatta: [info@civitanova.it]

## 🔒 Sicurezza in Produzione

1. **Credenziali Admin**:
   - Dopo aver creato l'utente admin con `create-production-admin.js`, conserva le credenziali in un luogo sicuro
   - Rimuovi il file `admin-credentials.txt` generato dallo script dal server di produzione

2. **Variabili d'Ambiente**:
   - Non committare mai i file `.env.production` nel repository
   - Utilizza i secret manager del tuo provider di hosting quando possibile

3. **Database**:
   - Configura correttamente le regole di sicurezza in Firebase Firestore
   - Esegui regolarmente backup del database Firebase

4. **Monitoraggio**:
   - Implementa un sistema di logging per tracciare errori e attività sospette
   - Configura alert per attività anomale

---

Sviluppato con ❤️ per Civitanova Marche