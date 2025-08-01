// Versione alternativa semplificata della registrazione
// Usa questa se la versione principale continua a dare problemi

// Sostituisci la sezione di salvataggio nel database (righe 180-225 circa) con questo codice:

/*
    // Versione semplificata - salva i dati utente nella tabella 'users' di Supabase
    if (data.user) {
      try {
        const userData = {
          id: data.user.id,
          email: signupEmail,
          display_name: `${signupName} ${signupSurname}`,
          username: signupUsername,
          phone: signupPhone,
          birthdate: signupBirth,
          role: signupRole
        };

        console.log('Tentativo inserimento utente:', userData);

        const { data: insertedData, error: dbError } = await supabase
          .from('users')
          .insert(userData)
          .select();
        
        if (dbError) {
          console.error('Errore database dettagliato:', {
            message: dbError.message,
            code: dbError.code,
            details: dbError.details,
            hint: dbError.hint
          });
          
          // Messaggi di errore più specifici
          let errorMessage = 'Errore salvataggio utente: ';
          if (dbError.code === '23505') {
            errorMessage += 'Username o email già esistenti';
          } else if (dbError.code === '42P01') {
            errorMessage += 'Tabella database non trovata';
          } else if (dbError.code === '42501') {
            errorMessage += 'Permessi insufficienti';
          } else {
            errorMessage += dbError.message;
          }
          
          setSignupError(errorMessage);
          setLoading(false);
          return;
        }

        console.log('Utente inserito con successo:', insertedData);
        
      } catch (err) {
        console.error('Errore catch generico:', err);
        setSignupError('Errore di connessione al database: ' + (err instanceof Error ? err.message : String(err)));
        setLoading(false);
        return;
      }
    }
*/