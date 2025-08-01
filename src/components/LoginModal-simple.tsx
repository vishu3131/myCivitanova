// Versione semplificata per test - SOSTITUISCI TEMPORANEAMENTE il contenuto di LoginModal.tsx con questo
// per vedere se il problema è nell'inserimento database o altrove

// Copia tutto il contenuto del LoginModal.tsx originale, ma sostituisci la sezione 
// "// Salva i dati utente nella tabella 'users' di Supabase" (circa righe 180-250) con:

/*
    // VERSIONE TEST - SALTA IL SALVATAGGIO DATABASE
    if (data.user) {
      setDebugInfo('✅ Utente Auth creato con successo: ' + data.user.id + '\n🚫 Salvataggio database SALTATO per test');
      console.log('Test: Utente creato in Auth ma non salvato in database:', data.user);
    }
*/

// Se con questa modifica la registrazione funziona, allora il problema è nel salvataggio database.
// Se continua a dare errore, il problema è altrove (validazione, auth, ecc.)