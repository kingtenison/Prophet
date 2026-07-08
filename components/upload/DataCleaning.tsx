'use client'

import { useState } from 'react'
import { useUploadStore } from '@/store/useUploadStore'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { 
  Trash2, 
  RefreshCw, 
  Filter, 
  Type, 
  ChevronRight, 
  ChevronDown,
  Wand2,
  AlertCircle
} from 'lucide-react'
import { ColumnType } from '@/types'

export function DataCleaning() {
  const { 
    columns, 
    parsedData, 
    removeDuplicates, 
    handleMissingValues, 
    renameColumn, 
    filterRows, 
    changeDataType,
    smartClean
  } = useUploadStore()

  const [renaming, setRenaming] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 bg-white/5 border-white/10 hover:border-[#2563EB]/40 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Deduplication</h3>
              <p className="text-xs text-white/50">Remove exact duplicate rows</p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full"
            onClick={removeDuplicates}
          >
            Remove Duplicates
          </Button>
        </Card>

        <Card className="p-4 bg-white/5 border-white/10 hover:border-[#2563EB]/40 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Missing Values</h3>
              <p className="text-xs text-white/50">Handle null or empty cells</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1 min-w-[80px] text-xs py-1.5 h-auto"
              onClick={() => handleMissingValues('drop')}
            >
              Drop Rows
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1 min-w-[80px] text-xs py-1.5 h-auto"
              onClick={() => handleMissingValues('fill-zero')}
            >
              Fill Zero
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1 min-w-[80px] text-xs py-1.5 h-auto"
              onClick={() => handleMissingValues('fill-mean')}
            >
              Fill Mean
            </Button>
          </div>
        </Card>

        <Card className="p-4 bg-white/5 border-white/10 hover:border-[#2563EB]/40 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Smart Clean</h3>
              <p className="text-xs text-white/50">Trim spaces and normalize text</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="w-full" onClick={smartClean}>
            Auto Clean
          </Button>
        </Card>
      </div>

      <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Type className="w-4 h-4 text-[#2563EB]" />
            Column Definitions & Transformation
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-white/40 hover:text-white"
            onClick={() => setShowResetConfirm(true)}
          >
            <RefreshCw className="w-3 h-3 mr-1.5" />
            Reset All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-white/40">
                <th className="px-4 py-3 text-left font-medium">Column Name</th>
                <th className="px-4 py-3 text-left font-medium">Data Type</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {columns.map((col) => (
                <tr key={col.name} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    {renaming === col.name ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          value={newName} 
                          onChange={(e) => setNewName(e.target.value)}
                          className="h-8 py-0"
                          autoFocus
                        />
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 px-2 text-green-400"
                          onClick={() => {
                            if (newName) renameColumn(col.name, newName)
                            setRenaming(null)
                            setNewName('')
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <span className="text-white font-medium">{col.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select 
                      value={col.type}
                      onChange={(e) => changeDataType(col.name, e.target.value as ColumnType)}
                      className="bg-transparent border-none text-white/60 focus:ring-0 cursor-pointer hover:text-[#2563EB] transition-colors"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="boolean">Boolean</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 hover:text-[#2563EB]"
                      onClick={() => {
                        setRenaming(col.name)
                        setNewName(col.name)
                      }}
                    >
                      Rename
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmDialog
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => { setShowResetConfirm(false); window.location.reload() }}
        title="Reset All Changes"
        message="This will discard all cleaning changes and reload the page. Unsaved progress will be lost."
        confirmLabel="Reset Everything"
        variant="warning"
      />
    </div>
  )
}
