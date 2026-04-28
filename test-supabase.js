const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envData = fs.readFileSync('.env.local', 'utf8');
const env = envData.split('\n').reduce((acc, line) => {
  const [k, ...v] = line.split('=');
  if (k && v.length) acc[k.trim()] = v.join('=').trim().replace(/['"]/g, '');
  return acc;
}, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  const { data, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'octetgamer10@gmail.com',
    password: 'hansen123'
  });
  
  if (loginError) {
    console.error('Login error:', loginError);
    return;
  }
  
  const user = data.user;
  console.log('Logged in as', user.id);
  
  const fileContent = fs.readFileSync('sample_sales.csv');
  const fileName = `${user.id}/test_upload_${Date.now()}.csv`;
  
  console.log('Uploading to datasets bucket...');
  const { error: uploadError } = await supabase.storage
    .from('datasets')
    .upload(fileName, fileContent, {
      contentType: 'text/csv'
    });
    
  if (uploadError) {
    console.error('Upload Error:', uploadError);
    return;
  }
  
  console.log('Upload successful!');
  
  const { error: dbError } = await supabase.from('datasets').insert({
    user_id: user.id,
    name: 'test_upload',
    file_path: fileName,
    columns: [{name: 'Date', type: 'date'}],
    row_count: 5,
  });
  
  if (dbError) {
    console.error('DB Insert Error:', dbError);
    return;
  }
  
  console.log('DB Insert successful!');
}

testUpload();
