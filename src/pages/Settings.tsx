import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings2, 
  Building2, 
  Shield,
  Bell,
  Database,
  Cloud,
  Download,
  Upload,
  Key,
  Globe,
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Users
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LogoUploadSection } from '@/components/LogoUploadSection';
import { TaxIntegrationSettings } from '@/components/TaxIntegrationSettings';
import { EmployeeManagement } from '@/components/EmployeeManagement';

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    mobile: false,
    reports: true,
    payments: true,
    security: true
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    frequency: 'daily',
    encryption: true,
    cloudSync: false
  });

  // Fetch company settings from database
  const { data: companySettings, isLoading } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const [companyData, setCompanyData] = useState({
    company_name: '',
    tax_id: '',
    address: '',
    phone: '',
    email: '',
    bank_account: '',
    monthly_work_hours: '160',
  });

  useEffect(() => {
    if (companySettings) {
      setCompanyData({
          company_name: companySettings.company_name || '',
          tax_id: companySettings.tax_id || '',
          address: companySettings.address || '',
          phone: companySettings.phone || '',
          email: companySettings.email || '',
          bank_account: companySettings.bank_account || '',
          monthly_work_hours: (companySettings as any).monthly_work_hours?.toString() || '160'
        });
    }
  }, [companySettings]);

  // Update company settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<typeof companyData>) => {
      const { error } = await supabase
        .from('company_settings')
        .update(updates)
        .eq('id', companySettings?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      toast({
        title: "Settings Updated",
        description: "Company settings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    }
  });

  const handleSaveCompanyInfo = () => {
    // Ensure monthly_work_hours is stored as integer in DB
    const updates: any = { ...companyData };
    if (updates.monthly_work_hours !== undefined) {
      const parsed = parseInt(updates.monthly_work_hours as any, 10);
      updates.monthly_work_hours = Number.isFinite(parsed) ? parsed : 160;
    }
    updateSettingsMutation.mutate(updates);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Configure your FP Mobility accounting system</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </Button>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Import Settings
            </Button>
          </div>
        </div>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input 
                      id="company-name" 
                      value={companyData.company_name}
                      onChange={(e) => setCompanyData({...companyData, company_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax-id">Tax ID</Label>
                    <Input 
                      id="tax-id" 
                      value={companyData.tax_id}
                      onChange={(e) => setCompanyData({...companyData, tax_id: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-address">Address</Label>
                    <Input 
                      id="company-address" 
                      value={companyData.address}
                      onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Phone</Label>
                    <Input 
                      id="company-phone" 
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-email">Email</Label>
                    <Input 
                      id="company-email" 
                      value={companyData.email}
                      onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank-account">Bank Account</Label>
                    <Input 
                      id="bank-account" 
                      value={companyData.bank_account}
                      onChange={(e) => setCompanyData({...companyData, bank_account: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly-work-hours">Monthly Working Hours</Label>
                    <Input
                      id="monthly-work-hours"
                      type="number"
                      value={companyData.monthly_work_hours}
                      onChange={(e) => setCompanyData({ ...companyData, monthly_work_hours: e.target.value })}
                      placeholder="160"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveCompanyInfo} disabled={updateSettingsMutation.isPending}>
                  {updateSettingsMutation.isPending ? 'Saving...' : 'Save Company Information'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Logo Upload Section */}
        <LogoUploadSection currentLogoUrl={companySettings?.logo_url} />

        {/* Tax Integration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Tax Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaxIntegrationSettings />
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security & Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Password & Authentication</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
              </div>
              <Button variant="outline">Update Password</Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Authentication</p>
                  <p className="text-sm text-muted-foreground">Receive codes via SMS</p>
                </div>
                <Badge variant="outline">
                  <Smartphone className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">App Authentication</p>
                  <p className="text-sm text-muted-foreground">Use authenticator app</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bank Integration</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Tink Bank Connection</p>
                    <p className="text-sm text-muted-foreground">Connect your bank accounts via Tink</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/bank-integration'}>
                    Configure
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch 
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Browser Notifications</p>
                  <p className="text-sm text-muted-foreground">Push notifications in browser</p>
                </div>
                <Switch 
                  checked={notifications.browser}
                  onCheckedChange={(checked) => setNotifications({...notifications, browser: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mobile Notifications</p>
                  <p className="text-sm text-muted-foreground">Push to mobile app</p>
                </div>
                <Switch 
                  checked={notifications.mobile}
                  onCheckedChange={(checked) => setNotifications({...notifications, mobile: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Report Generation</p>
                  <p className="text-sm text-muted-foreground">Notify when reports are ready</p>
                </div>
                <Switch 
                  checked={notifications.reports}
                  onCheckedChange={(checked) => setNotifications({...notifications, reports: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Alerts</p>
                  <p className="text-sm text-muted-foreground">Outstanding payment reminders</p>
                </div>
                <Switch 
                  checked={notifications.payments}
                  onCheckedChange={(checked) => setNotifications({...notifications, payments: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Security Alerts</p>
                  <p className="text-sm text-muted-foreground">Login attempts and security events</p>
                </div>
                <Switch 
                  checked={notifications.security}
                  onCheckedChange={(checked) => setNotifications({...notifications, security: checked})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backup & Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Backup & Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Automatic Backup</p>
                  <p className="text-sm text-muted-foreground">Regular data backup to local storage</p>
                </div>
                <Switch 
                  checked={backupSettings.autoBackup}
                  onCheckedChange={(checked) => setBackupSettings({...backupSettings, autoBackup: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Encryption</p>
                  <p className="text-sm text-muted-foreground">Encrypt stored financial data</p>
                </div>
                <Switch 
                  checked={backupSettings.encryption}
                  onCheckedChange={(checked) => setBackupSettings({...backupSettings, encryption: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cloud Sync</p>
                  <p className="text-sm text-muted-foreground">Sync to Google Drive (encrypted)</p>
                </div>
                <Switch 
                  checked={backupSettings.cloudSync}
                  onCheckedChange={(checked) => setBackupSettings({...backupSettings, cloudSync: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <select 
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  value={backupSettings.frequency}
                  onChange={(e) => setBackupSettings({...backupSettings, frequency: e.target.value})}
                >
                  <option value="hourly">Every Hour</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Backup
              </Button>
              <Button variant="outline">
                <Cloud className="h-4 w-4 mr-2" />
                Sync to Cloud
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Employees & HR moved to HRM module */}

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings2 className="h-5 w-5 mr-2" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Application Version</p>
                <p className="font-medium">FP Mobility v1.0.0</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Database Provider</p>
                <p className="font-medium">Supabase (PostgreSQL)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-medium">{companySettings?.company_name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Currency</p>
                <p className="font-medium">{companySettings?.currency || 'EUR'}</p>
              </div>
            </div>
            <div className="mt-6 flex space-x-2">
              <Button variant="outline">Check for Updates</Button>
              <Button variant="outline">System Diagnostics</Button>
              <Button variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}