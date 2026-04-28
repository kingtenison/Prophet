import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const envStr = fs.readFileSync('.env.local', 'utf8')
const env: Record<string, string> = {}
for (const line of envStr.split('\n')) {
  if (line.includes('=')) {
    const [k, ...v] = line.split('=')
    env[k.trim()] = v.join('=').trim()
  }
}

const supabase = createClient(
  env['NEXT_PUBLIC_SUPABASE_URL'],
  env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
)

async function run() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'octetgamer10@gmail.com',
    password: 'hansen123'
  })
  
  if (authError) {
    console.error('Auth Error:', authError)
    return
  }
  
  console.log('Logged in as:', authData.user?.id)

  const { data: datasets, error } = await supabase.from('datasets').select('*')
  console.log('Datasets length:', datasets?.length)
  if (error) console.error('Error:', error)
  
  if (datasets && datasets.length > 0) {
    const ds = datasets[0]
    console.log('Dataset:', ds)
    const { data: fileData, error: fileError } = await supabase.storage.from('datasets').download(ds.file_path)
    if (fileError) {
      console.error('File Error:', fileError)
    } else {
      const text = await fileData.text()
      console.log(`File content length: ${text.length} chars`)
      console.log('First 100 chars:', JSON.stringify(text.substring(0, 100)))
    }
  }
}

run()
