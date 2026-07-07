'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Dataset, Dashboard } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Database,
  LayoutDashboard,
  Plus,
  Upload,
  BarChart3,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import { formatDate, formatBytes } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [datasets, setDatasets] = useState<(Dataset & { file_size?: number })[]>([]);
  const [dashboards, setDashboards] = useState<(Dashboard & { widgetCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: datasetsData } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: dashboardsData } = await supabase
        .from('dashboards')
        .select('*')
        .order('updated_at', { ascending: false });

      // Batch widget counts: single query aggregates all dashboard widget counts
      const dbIds = (dashboardsData || []).map(d => d.id)
      const widgetCounts = new Map<string, number>()
      if (dbIds.length > 0) {
        const { data: allWidgets } = await supabase
          .from('widgets')
          .select('dashboard_id')
          .in('dashboard_id', dbIds)
        if (allWidgets) {
          allWidgets.forEach(w => {
            widgetCounts.set(w.dashboard_id, (widgetCounts.get(w.dashboard_id) || 0) + 1)
          })
        }
      }

      const dashboardsWithWidgets = (dashboardsData || []).map(d => ({
        ...d,
        widgetCount: widgetCounts.get(d.id) || 0
      }))

      // Batch file sizes: single storage list call
      const datasetsWithSize = await Promise.all(
        (datasetsData || []).map(async (d) => {
          let fileSize = 0
          if (d.file_path) {
            const { data: fileInfo } = await supabase.storage
              .from('datasets')
              .list('', { search: d.file_path.split('/').pop() })
            if (fileInfo && fileInfo.length > 0) {
              fileSize = fileInfo[0].metadata?.size || 0
            }
          }
          return { ...d, file_size: fileSize }
        })
      )

      setDatasets(datasetsWithSize);
      setDashboards(dashboardsWithWidgets);
      setLoading(false);
    }

    fetchData();
  }, [router, supabase]);

  const handleDeleteDataset = async (id: string) => {
    if (!confirm('Are you sure? This will delete the dataset and its widgets.')) return;

    const { error } = await supabase.from('datasets').delete().eq('id', id);
    if (!error) {
      setDatasets(datasets.filter(d => d.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-white/5 rounded-lg w-1/4" />
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Your Workspace</h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>Manage your datasets and interactive dashboards</p>
        </div>
        <div className="flex gap-3">
          <Link href="/datasets/upload">
            <Button className="btn-secondary"><Upload className="w-4 h-4 mr-2" />Upload Data</Button>
          </Link>
          <Link href="/dashboards/new">
            <Button className="btn-primary"><Plus className="w-4 h-4 mr-2" />New Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Content Area (Spans 3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="p-6 glass border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500"><Database className="w-24 h-24 text-blue-500" /></div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20"><Database className="w-6 h-6" /></div>
                <div><p className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{datasets.length}</p><p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Datasets</p></div>
              </div>
            </Card>
            <Card className="p-6 glass border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500"><BarChart3 className="w-24 h-24 text-cyan-400" /></div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><BarChart3 className="w-6 h-6" /></div>
                <div><p className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{dashboards.reduce((acc, d) => acc + d.widgetCount, 0)}</p><p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Active Charts</p></div>
              </div>
            </Card>
            <Card className="p-6 glass border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500"><LayoutDashboard className="w-24 h-24 text-indigo-400" /></div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"><LayoutDashboard className="w-6 h-6" /></div>
                <div><p className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{dashboards.length}</p><p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Dashboards</p></div>
              </div>
            </Card>
          </div>

          {/* Dashboards Bento Area */}
          <Card className="glass border-white/5 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10"><LayoutDashboard className="w-5 h-5 text-indigo-400" /></div>
                <h2 className="text-xl font-display font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Dashboards</h2>
              </div>
              <Link href="/dashboards/new" className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">View all</Link>
            </div>
            <div className="p-6 bg-black/20">
              {dashboards.length === 0 ? (
                <EmptyState icon="dashboard" title="No dashboards yet" description="Create your first dashboard to organize your visualisations" action={<Link href="/dashboards/new"><Button className="btn-primary"><LayoutDashboard className="w-4 h-4 mr-2" />Create Dashboard</Button></Link>} />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {dashboards.slice(0, 4).map(dashboard => (
                    <div key={dashboard.id} className="group p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-semibold truncate text-lg group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-primary)' }}>{dashboard.title}</h3>
                        {dashboard.is_public && <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/15 text-emerald-400 rounded-full uppercase tracking-wider">Public</span>}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/40 mb-5">
                        <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {dashboard.widgetCount} widgets</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(dashboard.updated_at)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboards/${dashboard.id}/edit`} className="flex-1"><button className="w-full py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white transition-colors">Edit</button></Link>
                        <Link href={`/dashboards/${dashboard.id}/view`} className="flex-1"><button className="w-full py-2 rounded-lg text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors">View Live</button></Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Side Column (Spans 1 column) */}
        <div className="lg:col-span-1">
          <Card className="glass border-white/5 flex flex-col h-full overflow-hidden min-h-[500px]">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10"><Database className="w-5 h-5 text-blue-400" /></div>
                <h2 className="text-lg font-display font-semibold" style={{ color: 'var(--text-primary)' }}>Datasets</h2>
              </div>
            </div>
            
            <div className="p-4 flex-1 bg-black/20 overflow-y-auto">
              {datasets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4"><Database className="w-5 h-5 text-white/30" /></div>
                  <p className="text-sm font-medium text-white">No data uploaded</p>
                  <p className="text-xs text-white/40 mt-1 mb-4">Start by uploading a CSV</p>
                  <Link href="/datasets/upload"><button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors">Upload Now</button></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {datasets.slice(0, 6).map(dataset => (
                    <div key={dataset.id} className="p-4 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm text-white truncate max-w-[140px] group-hover:text-blue-400 transition-colors" title={dataset.name}>{dataset.name}</h3>
                        <button onClick={() => handleDeleteDataset(dataset.id)} className="text-white/20 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"><MoreHorizontal className="w-4 h-4" /></button>
                      </div>
                       <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40 font-mono bg-white/5 px-2 py-0.5 rounded">{formatBytes(dataset.file_size || 0)}</span>
                         <span className="text-white/30">{dataset.row_count.toLocaleString()} rows</span>
                       </div>
                    </div>
                  ))}
                  
                  {datasets.length > 6 && (
                    <div className="pt-4 mt-2 border-t border-white/5 text-center">
                      <Link href="/datasets" className="text-xs text-white/40 hover:text-white transition-colors font-medium">View all {datasets.length} datasets</Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
