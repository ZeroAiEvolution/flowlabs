import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, FolderGit2, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    professionals: 0,
    content: 0,
    projects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);

    const [
      { count: totalUsers },
      { count: students },
      { count: professionals },
      { count: content },
      { count: projects },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profession', 'student'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profession', 'professional'),
      supabase.from('content').select('*', { count: 'exact', head: true }),
      supabase.from('student_projects').select('*', { count: 'exact', head: true }),
    ]);

    setStats({
      totalUsers: totalUsers || 0,
      students: students || 0,
      professionals: professionals || 0,
      content: content || 0,
      projects: projects || 0,
    });

    setLoading(false);
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary' },
    { title: 'Students', value: stats.students, icon: UserCheck, color: 'text-primary' },
    { title: 'Professionals', value: stats.professionals, icon: UserCheck, color: 'text-primary' },
    { title: 'Content Items', value: stats.content, icon: FileText, color: 'text-primary' },
    { title: 'Projects', value: stats.projects, icon: FolderGit2, color: 'text-primary' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {loading ? '...' : stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/admin/users" className="block p-3 rounded-lg hover:bg-secondary transition-colors">
              Manage Users →
            </a>
            <a href="/admin/content" className="block p-3 rounded-lg hover:bg-secondary transition-colors">
              Manage Content →
            </a>
            <a href="/admin/projects" className="block p-3 rounded-lg hover:bg-secondary transition-colors">
              Manage Projects →
            </a>
            <a href="/admin/roles" className="block p-3 rounded-lg hover:bg-secondary transition-colors">
              Manage Roles →
            </a>
            <a href="/admin/team" className="block p-3 rounded-lg hover:bg-secondary transition-colors">
              Manage Team →
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Info</CardTitle>
            <CardDescription>System information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Status</span>
              <span className="text-primary font-medium">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Database</span>
              <span className="font-medium">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Storage</span>
              <span className="font-medium">Active</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
