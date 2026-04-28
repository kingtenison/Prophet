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
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
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

      setDatasets(datasetsData || []);
      setDashboards(dashboardsData || []);
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
        <div className="h-10 bg-[#16191f] rounded-lg w-1/4" />
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-[#0d0f14] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[#f0f2f8]">Your workspace</h1>
          <p className="text-[#8b91a7] mt-1">Manage your datasets and dashboards</p>
        </div>
        <div className="flex gap-3">
          <Link href="/datasets/upload">
            <Button><Upload className="w-4 h-4 mr-2" />Upload dataset</Button>
          </Link>
          <Link href="/charts/new">
            <Button variant="secondary"><BarChart3 className="w-4 h-4 mr-2" />Create Chart</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card"><Card hoverable raised>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary-500/20 text-primary-500"><Database className="w-5 h-5" /></div>
              <div><p className="text-2xl font-bold text-[#f0f2f8]">{datasets.length}</p><p className="text-sm text-[#8b91a7]">Datasets</p></div>
            </div>
          </Card></div>
        <div className="stat-card"><Card hoverable raised>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400"><BarChart3 className="w-5 h-5" /></div>
              <div><p className="text-2xl font-bold text-[#f0f2f8]">{dashboards.reduce((acc, d) => acc + (d.layout ? Object.keys(d.layout).length : 0), 0)}</p><p className="text-sm text-[#8b91a7]">Charts</p></div>
            </div>
          </Card></div>
        <div className="stat-card"><Card hoverable raised>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400"><LayoutDashboard className="w-5 h-5" /></div>
              <div><p className="text-2xl font-bold text-[#f0f2f8]">{dashboards.length}</p><p className="text-sm text-[#8b91a7]">Dashboards</p></div>
            </div>
          </Card></div>
      </div>

      <section className="space-y-4"><div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#f0f2f8]">Datasets</h2>
          <Link href="/datasets/upload" className="text-sm text-primary-500 hover:text-primary-400 font-medium">View all</Link>
        </div>

        {datasets.length === 0 ? (<EmptyState icon="dataset" title="No datasets yet" description="Upload your first CSV or Excel file to get started"
            action={<Link href="/datasets/upload"><Button><Upload className="w-4 h-4 mr-2" />Upload Dataset</Button></Link>} />
          ) : (<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {datasets.slice(0, 6).map(dataset => (<Card key={dataset.id} hoverable raised className="group">
                <div className="flex items-start justify-between">
                  <div className="p-4 rounded-xl bg-primary-500/20 text-primary-500"><Database className="w-6 h-6" /></div>
                  <button className="p-2 text-[#8b91a7] hover:text-[#d1d5db] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-[#f0f2f8] truncate">{dataset.name}</h3>
                  <div className="mt-2 flex items-center gap-4 text-xs text-[#8b91a7]"><span>{dataset.row_count.toLocaleString()} rows</span><span>•</span><span>{dataset.columns.length} columns</span></div>
                  <p className="mt-2 text-xs text-[#4b5162]">Uploaded {formatDate(dataset.created_at)}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.07] flex gap-2">
                  <Link href={`/datasets/${dataset.id}`} className="flex-1"><Button variant="secondary" size="sm" className="w-full">View</Button></Link>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteDataset(dataset.id)} className="text-rose-500 hover:text-rose-400">Delete</Button>
                </div>
              </Card>))}
          </div>)}
      </section>

      <section className="space-y-4 pb-8"><div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#f0f2f8]">Dashboards</h2>
          <Link href="/dashboards/new" className="text-sm text-primary-500 hover:text-primary-400 font-medium">View all</Link>
        </div>

        {dashboards.length === 0 ? (<EmptyState icon="dashboard" title="No dashboards yet" description="Create your first dashboard to organize your visualisations"
            action={<Link href="/dashboards/new"><Button><LayoutDashboard className="w-4 h-4 mr-2" />Create Dashboard</Button></Link>} />
          ) : (<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboards.slice(0, 6).map(dashboard => (<Card key={dashboard.id} hoverable raised className="group">
                <div className="flex items-start justify-between">
                  <div className="p-4 rounded-xl bg-indigo-500/10 text-indigo-400"><LayoutDashboard className="w-6 h-6" /></div>
                  <div className="flex items-center gap-2">{dashboard.is_public && <span className="px-2 py-1 text-xs font-medium bg-emerald-500/15 text-emerald-400 rounded-full">Public</span>}</div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-[#f0f2f8] truncate">{dashboard.title}</h3>
                  <div className="mt-2 flex items-center gap-4 text-xs text-[#8b91a7]"><span>{Object.keys(dashboard.layout || {}).length} widgets</span><span>•</span><span>Updated {formatDate(dashboard.updated_at)}</span></div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.07] flex gap-2">
                  <Link href={`/dashboards/${dashboard.id}/edit`} className="flex-1"><Button variant="secondary" size="sm" className="w-full">Edit</Button></Link>
                  <Link href={`/dashboards/${dashboard.id}/view`} className="flex-1"><Button variant="ghost" size="sm" className="w-full">View</Button></Link>
                </div>
              </Card>))}
          </div>)}
      </section>
    </div>
  );
}
