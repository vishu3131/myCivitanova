const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = 'https://mrtxaubsdqxofumrwftm.supabase.co';
const supabaseKey = 'sb_publishable_Xr-LyG7c--FjqR84lRNkjQ_pTxCSRjG';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminStats() {
  console.log('🔍 Testing admin statistics...');
  
  try {
    // Test della funzione get_app_statistics
    console.log('\n📊 Calling get_app_statistics RPC...');
    const { data: appStats, error: statsError } = await supabase
      .rpc('get_app_statistics');
    
    if (statsError) {
      console.error('❌ Error calling get_app_statistics:', statsError);
      return;
    }
    
    console.log('✅ App Statistics received:');
    console.log(JSON.stringify(appStats, null, 2));
    
    // Test delle singole tabelle
    console.log('\n👥 Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, is_active, created_at')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Error reading profiles:', profilesError);
    } else {
      console.log(`✅ Found ${profiles.length} profiles:`);
      profiles.forEach(profile => {
        console.log(`  - ${profile.email} (${profile.full_name || 'No name'}) - Active: ${profile.is_active}`);
      });
    }
    
    // Test delle news
    console.log('\n📰 Testing news table...');
    const { data: news, error: newsError } = await supabase
      .from('news')
      .select('id, title, status, created_at')
      .limit(5);
    
    if (newsError) {
      console.error('❌ Error reading news:', newsError);
    } else {
      console.log(`✅ Found ${news.length} news articles:`);
      news.forEach(article => {
        console.log(`  - ${article.title} (${article.status})`);
      });
    }
    
    // Test degli eventi
    console.log('\n📅 Testing events table...');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, status, start_date')
      .limit(5);
    
    if (eventsError) {
      console.error('❌ Error reading events:', eventsError);
    } else {
      console.log(`✅ Found ${events.length} events:`);
      events.forEach(event => {
        console.log(`  - ${event.title} (${event.status}) - ${event.start_date}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testAdminStats();