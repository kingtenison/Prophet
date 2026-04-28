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
  env['SUPABASE_SERVICE_ROLE_KEY']
)

async function run() {
  const { data: datasets, error } = await supabase.from('datasets').select('*')
  console.log('Datasets length:', datasets?.length)
  if (error) console.error('Error:', error)
  
  if (datasets && datasets.length > 0) {
    const ds = datasets[0]
    console.log('Row count:', ds.row_count)
    console.log('Columns:', ds.columns)
    const { data: fileData, error: fileError } = await supabase.storage.from('datasets').download(ds.file_path)
    if (fileError) {
      console.error('File Error:', fileError)
    } else {
      const text = await fileData.text()
      console.log(`File content length: ${text.length} chars`)
      console.log('First 100 chars:', text.substring(0, 100))
    }
  }
}

run()
