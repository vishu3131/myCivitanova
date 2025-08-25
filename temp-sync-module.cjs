
      const firebaseClient = require('./src/utils/firebaseClient.cjs');
      const supabaseClient = require('./src/utils/supabaseClient.cjs');
      const { firebaseSupabaseSync } = require('./src/services/firebaseSupabaseSync.cjs');
      
      module.exports = { firebaseSupabaseSync };
    