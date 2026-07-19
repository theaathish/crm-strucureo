import * as React from "react"
import { motion } from "framer-motion"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function SettingsSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function SettingsRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-8 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export function SettingsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-3xl">
      <PageHeader title="Settings" description="Manage your workspace and preferences" />

      <Tabs defaultValue="general">
        <TabsList className="h-8">
          <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs">Integrations</TabsTrigger>
          <TabsTrigger value="mcp" className="text-xs">MCP</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <SettingsSection title="Workspace" description="General workspace configuration">
              <SettingsRow label="Workspace Name" description="The name of your Strucureo workspace">
                <div className="flex items-center gap-2">
                  <Input defaultValue="Strucureo" className="h-8 w-48 text-xs" />
                  <Button size="sm" className="h-8 text-xs">Save</Button>
                </div>
              </SettingsRow>
              <SettingsRow label="Currency" description="Default currency for financial data">
                <Input defaultValue="USD" className="h-8 w-24 text-xs" />
              </SettingsRow>
              <SettingsRow label="Timezone" description="Default timezone for date display">
                <Input defaultValue="America/New_York" className="h-8 w-48 text-xs" />
              </SettingsRow>
            </SettingsSection>

            <Separator />

            <SettingsSection title="Display" description="Interface and display preferences">
              <SettingsRow label="Compact View" description="Reduce spacing for higher information density">
                <Switch />
              </SettingsRow>
              <SettingsRow label="Show Revenue in Sidebar" description="Display MRR counter in navigation">
                <Switch defaultChecked />
              </SettingsRow>
            </SettingsSection>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <SettingsSection title="Email Notifications" description="Configure when you receive email alerts">
              <SettingsRow label="Deal Won" description="When a deal is moved to Closed Won">
                <Switch defaultChecked />
              </SettingsRow>
              <SettingsRow label="Churn Risk Alert" description="When an account is flagged as at-risk">
                <Switch defaultChecked />
              </SettingsRow>
              <SettingsRow label="Weekly Pipeline Report" description="Automated weekly summary email">
                <Switch defaultChecked />
              </SettingsRow>
              <SettingsRow label="Task Reminders" description="Email reminders for overdue tasks">
                <Switch defaultChecked />
              </SettingsRow>
              <SettingsRow label="New Lead Assigned" description="When a lead is assigned to you">
                <Switch />
              </SettingsRow>
            </SettingsSection>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <SettingsSection title="Authentication" description="Security settings for your account">
              <SettingsRow label="Two-Factor Authentication" description="Add an extra layer of security">
                <Button variant="outline" size="sm" className="h-8 text-xs">Enable 2FA</Button>
              </SettingsRow>
              <SettingsRow label="Session Timeout" description="Auto-logout after inactivity">
                <Input defaultValue="30 minutes" className="h-8 w-36 text-xs" />
              </SettingsRow>
            </SettingsSection>
            <Separator />
            <SettingsSection title="Audit Logs" description="Track all user actions in the workspace">
              <SettingsRow label="Enable Audit Logging" description="Record all user activity for compliance">
                <Switch defaultChecked />
              </SettingsRow>
              <SettingsRow label="Retention Period" description="How long audit logs are retained">
                <Input defaultValue="90 days" className="h-8 w-36 text-xs" />
              </SettingsRow>
            </SettingsSection>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <SettingsSection title="Connected Integrations" description="Manage third-party integrations">
              {[
                { name: "Slack", description: "Receive CRM alerts in Slack channels", connected: true },
                { name: "HubSpot", description: "Sync contacts and deals with HubSpot", connected: false },
                { name: "Salesforce", description: "Bidirectional sync with Salesforce", connected: false },
                { name: "Stripe", description: "Sync billing and revenue data", connected: true },
                { name: "Linear", description: "Link tasks to Linear issues", connected: false },
              ].map(integration => (
                <SettingsRow key={integration.name} label={integration.name} description={integration.description}>
                  <Button
                    variant={integration.connected ? "outline" : "default"}
                    size="sm"
                    className="h-8 text-xs"
                  >
                    {integration.connected ? "Disconnect" : "Connect"}
                  </Button>
                </SettingsRow>
              ))}
            </SettingsSection>
          </div>
        </TabsContent>

        <TabsContent value="mcp" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <SettingsSection title="MCP Server Configuration" description="Connect to your MCP server for tool execution">
              <SettingsRow label="Server URL" description="The URL of your MCP server">
                <Input defaultValue="http://localhost:3001" className="h-8 w-64 text-xs" />
              </SettingsRow>
              <SettingsRow label="API Key" description="Authentication key for the MCP server">
                <Input type="password" defaultValue="sk-mcp-key" className="h-8 w-64 text-xs" />
              </SettingsRow>
              <SettingsRow label="Status">
                <Button size="sm" className="h-8 text-xs">Connect</Button>
              </SettingsRow>
            </SettingsSection>

            <Separator />

            <SettingsSection title="MCP Tools" description="Available tools provided by the MCP server">
              {[
                { name: "search_records", description: "Search records across all modules", active: true },
                { name: "create_record", description: "Create new records in any module", active: true },
                { name: "update_record", description: "Update existing records", active: true },
                { name: "delete_record", description: "Delete records from the system", active: true },
                { name: "query_database", description: "Execute read-only database queries", active: false },
              ].map(tool => (
                <SettingsRow key={tool.name} label={tool.name} description={tool.description}>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium ${tool.active ? "text-emerald-500" : "text-muted-foreground"}`}>
                      {tool.active ? "Active" : "Inactive"}
                    </span>
                    <Switch defaultChecked={tool.active} />
                  </div>
                </SettingsRow>
              ))}
            </SettingsSection>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
