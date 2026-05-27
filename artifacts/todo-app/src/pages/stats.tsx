import { useGetTodoStats, getGetTodoStatsQueryKey } from "@workspace/api-client-react";
import { CheckCircle2, Clock, AlertCircle, LayoutList } from "lucide-react";

export function StatsPage() {
  const { data: stats, isLoading } = useGetTodoStats({
    query: { queryKey: getGetTodoStatsQueryKey() }
  });

  if (isLoading || !stats) {
    return (
      <div className="p-6 md:p-12 space-y-8 animate-in fade-in duration-500">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-card rounded-xl border border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="p-6 md:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-serif font-bold text-foreground">Productivity Summary</h2>
        <p className="text-muted-foreground mt-2">A high-level view of your focus and accomplishments.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={<LayoutList size={24} className="text-primary" />}
          description="Tasks created overall"
          delay={0}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle2 size={24} className="text-emerald-500" />}
          description={`${completionRate}% completion rate`}
          delay={100}
        />
        <StatCard
          title="Active Focus"
          value={stats.active}
          icon={<Clock size={24} className="text-amber-500" />}
          description="Tasks currently in progress"
          delay={200}
        />
        <StatCard
          title="High Priority"
          value={stats.highPriority}
          icon={<AlertCircle size={24} className="text-rose-500" />}
          description="Items needing immediate attention"
          delay={300}
        />
      </div>

      {stats.dueSoon > 0 && (
        <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl flex items-start gap-4 animate-in fade-in zoom-in duration-500 delay-500 fill-mode-both">
          <AlertCircle className="text-amber-600 dark:text-amber-500 mt-1 shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-400">Deadlines approaching</h3>
            <p className="text-amber-800/80 dark:text-amber-500/80 mt-1">
              You have {stats.dueSoon} task{stats.dueSoon === 1 ? '' : 's'} due soon. Check your active tasks to ensure nothing slips through the cracks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, description, delay }: { title: string, value: number, icon: React.ReactNode, description: string, delay: number }) {
  return (
    <div 
      className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-4xl font-serif font-semibold text-foreground mt-2">{value}</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          {icon}
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-4">{description}</p>
    </div>
  );
}
