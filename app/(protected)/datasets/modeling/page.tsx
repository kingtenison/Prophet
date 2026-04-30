'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dataset } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/ToastProvider'
import { Database, Plus, Link as LinkIcon, ArrowRight, Table as TableIcon } from 'lucide-react'
import { PreviewTable } from '@/components/upload/DropZone'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export default function DataModelingPage() {
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()

  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  
  const [leftDatasetId, setLeftDatasetId] = useState<string>('')
  const [rightDatasetId, setRightDatasetId] = useState<string>('')
  const [leftCol, setLeftCol] = useState<string>('')
  const [rightCol, setRightCol] = useState<string>('')
  
  const [joinedData, setJoinedData] = useState<Record<string, any>[]>([])
  const [joinedCols, setJoinedCols] = useState<{name: string, type: any}[]>([])
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    fetchDatasets()
  }, [])

  const fetchDatasets = async () => {
    const { data, error } = await supabase.from('datasets').select('*').order('created_at', { ascending: false })
    if (error) {
      addToast({ type: 'error', title: 'Failed to load datasets' })
    } else {
      setDatasets(data || [])
    }
    setLoading(false)
  }

  const downloadAndParse = async (dataset: Dataset) => {
    const { data: fileBlob, error } = await supabase.storage.from('datasets').download(dataset.file_path)
    if (error) throw error
    
    if (dataset.file_path.endsWith('.csv')) {
      const text = await fileBlob.text()
      return new Promise<any[]>((resolve) => {
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data),
        })
      })
    } else {
      const buffer = await fileBlob.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])
    }
  }

  const handleJoin = async () => {
    if (!leftDatasetId || !rightDatasetId || !leftCol || !rightCol) {
      addToast({ type: 'error', title: 'Please select datasets and join columns' })
      return
    }

    setIsJoining(true)
    try {
      const leftDs = datasets.find(d => d.id === leftDatasetId)!
      const rightDs = datasets.find(d => d.id === rightDatasetId)!
      
      const leftData = await downloadAndParse(leftDs)
      const rightData = await downloadAndParse(rightDs)
      
      // Perform inner join
      const joined: any[] = []
      leftData.forEach(lRow => {
        const matching = rightData.filter(rRow => rRow[rightCol] == lRow[leftCol])
        matching.forEach(rRow => {
          // Merge rows, prefixing right columns to avoid conflicts
          const merged = { ...lRow }
          Object.keys(rRow).forEach(key => {
            if (key !== rightCol) {
              merged[`${rightDs.name}_${key}`] = rRow[key]
            }
          })
          joined.push(merged)
        })
      })

      if (joined.length === 0) {
        addToast({ type: 'warning', title: 'No matching rows found for the join' })
      } else {
        setJoinedData(joined)
        const cols = Object.keys(joined[0]).map(k => ({
          name: k,
          type: typeof joined[0][k] === 'number' ? 'number' : 'text'
        }))
        setJoinedCols(cols as any)
        addToast({ type: 'success', title: `Join complete: ${joined.length} rows created` })
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Join failed', message: err.message })
    } finally {
      setIsJoining(false)
    }
  }

  const handleSaveResult = async () => {
    if (joinedData.length === 0) return

    setIsJoining(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const leftDs = datasets.find(d => d.id === leftDatasetId)!
      const rightDs = datasets.find(d => d.id === rightDatasetId)!
      
      const fileName = `${user.id}/joined_${Date.now()}.csv`
      const csv = Papa.unparse(joinedData)
      
      const { error: uploadError } = await supabase.storage
        .from('datasets')
        .upload(fileName, csv, { contentType: 'text/csv' })

      if (uploadError) throw uploadError

      const { error: dbError } = await supabase.from('datasets').insert({
        user_id: user.id,
        name: `${leftDs.name} + ${rightDs.name} Joined`,
        file_path: fileName,
        columns: joinedCols,
        row_count: joinedData.length,
      })

      if (dbError) throw dbError

      addToast({ type: 'success', title: 'Joined dataset saved successfully!' })
      router.push('/dashboard')
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to save', message: err.message })
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Data Modeling</h1>
        <p className="text-white/50 mt-2">
          Connect different datasets to create powerful relationships.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dataset Selection */}
        <Card className="lg:col-span-2 p-6 space-y-6 bg-white/5 border-white/10">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-semibold text-white/40 uppercase">Left Dataset</label>
              <select 
                value={leftDatasetId}
                onChange={(e) => setLeftDatasetId(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#2563EB]"
              >
                <option value="">Select Dataset...</option>
                {datasets.map(ds => <option key={ds.id} value={ds.id}>{ds.name}</option>)}
              </select>
            </div>

            <div className="mt-6">
              <Plus className="w-5 h-5 text-white/20" />
            </div>

            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-semibold text-white/40 uppercase">Right Dataset</label>
              <select 
                value={rightDatasetId}
                onChange={(e) => setRightDatasetId(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#2563EB]"
              >
                <option value="">Select Dataset...</option>
                {datasets.map(ds => <option key={ds.id} value={ds.id}>{ds.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-semibold text-white/40 uppercase">Left Join Key</label>
              <select 
                value={leftCol}
                onChange={(e) => setLeftCol(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#2563EB]"
                disabled={!leftDatasetId}
              >
                <option value="">Select Column...</option>
                {datasets.find(d => d.id === leftDatasetId)?.columns.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="mt-6">
              <LinkIcon className="w-5 h-5 text-[#2563EB]" />
            </div>

            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-semibold text-white/40 uppercase">Right Join Key</label>
              <select 
                value={rightCol}
                onChange={(e) => setRightCol(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#2563EB]"
                disabled={!rightDatasetId}
              >
                <option value="">Select Column...</option>
                {datasets.find(d => d.id === rightDatasetId)?.columns.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleJoin} 
            loading={isJoining}
            disabled={!leftCol || !rightCol}
          >
            Run Join Analysis
          </Button>
        </Card>

        {/* Modeling Info */}
        <div className="space-y-4">
          <Card className="p-6 bg-gradient-to-br from-[#2563EB]/20 to-transparent border-[#2563EB]/30">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5" />
              How it works
            </h3>
            <p className="text-sm text-white/60 mt-4 leading-relaxed">
              Joins allow you to combine data from two different files based on a shared value (like an ID or Name).
            </p>
            <ul className="text-sm text-white/60 mt-4 space-y-2 list-disc list-inside">
              <li>Choose your "Left" (Primary) dataset.</li>
              <li>Choose your "Right" dataset to merge into the left one.</li>
              <li>Select the columns that match between them.</li>
              <li>The result will be a new combined dataset.</li>
            </ul>
          </Card>
        </div>
      </div>

      {joinedData.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-green-400" />
              Join Result Preview
            </h2>
            <Button onClick={handleSaveResult} loading={isJoining}>
              Save as New Dataset
            </Button>
          </div>

          <PreviewTable data={joinedData} columns={joinedCols} />
        </div>
      )}
    </div>
  )
}
