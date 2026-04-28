import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ datasetId: string }> }
) {
  const { datasetId } = await params
  const supabase = await createClient()

  // 1. Get dataset and check ownership/publicity
  // We use the authenticated client first to check if the user has access
  const { data: dataset, error: dsError } = await supabase
    .from('datasets')
    .select(`
      *,
      widgets:widgets(
        dashboard:dashboards(is_public, user_id)
      )
    `)
    .eq('id', datasetId)
    .single()

  if (dsError || !dataset) {
    return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
  }

  // 2. Authorization check
  const { data: { user } } = await supabase.auth.getUser()
  
  const isOwner = user?.id === dataset.user_id
  const isPublic = dataset.widgets?.some((w: any) => w.dashboard?.is_public) || false

  if (!isOwner && !isPublic) {
    return NextResponse.json({ error: 'Dataset not accessible' }, { status: 403 })
  }

  // 3. Download file
  // We use the authenticated client. If the user is logged in, RLS handles it.
  // If the user is NOT logged in but the dashboard is public, we might need the service role.
  // Actually, the Supabase storage bucket 'datasets' should have a policy for public access 
  // IF the associated dashboard is public. 
  
  // To keep it simple and secure, we'll use the authenticated client to download.
  // If it fails (e.g. anonymous user on public dashboard), we fall back to a service role client.
  
  let storageClient = supabase.storage.from('datasets')
  let { data: fileData, error: fileErr } = await storageClient.download(dataset.file_path)

  if (fileErr && !user) {
    // Fallback for anonymous public access
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: adminData, error: adminErr } = await adminSupabase.storage
      .from('datasets')
      .download(dataset.file_path)
    
    fileData = adminData
    fileErr = adminErr
  }

  if (fileErr || !fileData) {
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 })
  }

  // 4. Return raw file
  const isExcel = /\.(xlsx|xls)$/i.test(dataset.file_path)
  return new NextResponse(fileData, {
    headers: {
      'Content-Type': isExcel ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv',
      'Content-Disposition': `attachment; filename="${dataset.file_path.split('/').pop()}"`,
    },
  })
}
