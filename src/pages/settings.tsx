import * as React from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Copy, Check, ExternalLink, Terminal } from "lucide-react"
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

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs"
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
    >
      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
    </Button>
  )
}

export function SettingsPage() {
  const [showApiKey, setShowApiKey] = React.useState(false)
  const [mcpApiKey, setMcpApiKey] = React.useState(() => localStorage.getItem("mcp_api_key") ?? "sk-mcp-key")

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://crm-strucureo.vercel.app"
  const mcpUrl = `${baseUrl}/api/mcp`
  const restUrl = `${baseUrl}/api`

  const saveApiKey = (key: string) => {
    setMcpApiKey(key)
    localStorage.setItem("mcp_api_key", key)
  }

  const mcpTools = [
    { name: "list_leads", description: "List all leads with optional status filter", method: "POST", path: "/api/mcp" },
    { name: "get_lead", description: "Get lead by ID", method: "POST", path: "/api/mcp" },
    { name: "create_lead", description: "Create a new lead", method: "POST", path: "/api/mcp" },
    { name: "update_lead", description: "Update a lead", method: "POST", path: "/api/mcp" },
    { name: "delete_lead", description: "Delete a lead", method: "POST", path: "/api/mcp" },
    { name: "list_accounts", description: "List all accounts with optional filters", method: "POST", path: "/api/mcp" },
    { name: "get_account", description: "Get account by ID with related data", method: "POST", path: "/api/mcp" },
    { name: "create_account", description: "Create a new account", method: "POST", path: "/api/mcp" },
    { name: "update_account", description: "Update an account", method: "POST", path: "/api/mcp" },
    { name: "list_contacts", description: "List all contacts", method: "POST", path: "/api/mcp" },
    { name: "create_contact", description: "Create a new contact", method: "POST", path: "/api/mcp" },
    { name: "list_deals", description: "List all deals with optional stage filter", method: "POST", path: "/api/mcp" },
    { name: "get_deal", description: "Get deal by ID", method: "POST", path: "/api/mcp" },
    { name: "create_deal", description: "Create a new deal", method: "POST", path: "/api/mcp" },
    { name: "list_projects", description: "List all projects", method: "POST", path: "/api/mcp" },
    { name: "list_tasks", description: "List all tasks", method: "POST", path: "/api/mcp" },
    { name: "create_task", description: "Create a new task", method: "POST", path: "/api/mcp" },
    { name: "list_pilots", description: "List all pilots", method: "POST", path: "/api/mcp" },
    { name: "get_dashboard", description: "Get dashboard summary stats", method: "POST", path: "/api/mcp" },
  ]

  const restEndpoints = [
    { method: "GET", path: "/api/:entity", description: "List records" },
    { method: "GET", path: "/api/:entity/:id", description: "Get record by ID" },
    { method: "POST", path: "/api/:entity", description: "Create record" },
    { method: "PATCH", path: "/api/:entity/:id", description: "Update record" },
    { method: "DELETE", path: "/api/:entity/:id", description: "Delete record" },
    { method: "GET", path: "/api/dashboard", description: "Dashboard summary" },
    { method: "POST", path: "/api/auth/login", description: "Login" },
    { method: "GET", path: "/api/activities", description: "Activity log" },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-4xl">
      <PageHeader title="Settings" description="Manage your workspace and preferences" />

      <Tabs defaultValue="general">
        <TabsList className="h-8">
          <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs">Integrations</TabsTrigger>
          <TabsTrigger value="mcp" className="text-xs">MCP & API</TabsTrigger>
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
          <div className="rounded-xl border border-border bg-card p-6 space-y-8">
            {/* MCP Server URL */}
            <SettingsSection title="MCP Server (AI Tool Protocol)" description="Connect AI tools like Claude Code, Cursor, and Copilot to your CRM using the Model Context Protocol">
              <SettingsRow label="MCP Server URL" description="Use this URL to configure MCP clients">
                <div className="flex items-center gap-1">
                  <code className="text-[11px] bg-muted px-2 py-1 rounded font-mono">{mcpUrl}</code>
                  <CopyButton value={mcpUrl} />
                </div>
              </SettingsRow>
              <SettingsRow label="API Key" description="Authentication key sent via x-api-key header">
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={mcpApiKey}
                      onChange={e => saveApiKey(e.target.value)}
                      className="h-8 w-56 text-xs font-mono pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                  <CopyButton value={mcpApiKey} />
                </div>
              </SettingsRow>
              <SettingsRow label="Status">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-muted-foreground">Endpoint active</span>
                </div>
              </SettingsRow>
            </SettingsSection>

            <Separator />

            {/* REST API */}
            <SettingsSection title="REST API" description="Direct HTTP API for custom integrations">
              <SettingsRow label="Base URL" description="REST API root endpoint">
                <div className="flex items-center gap-1">
                  <code className="text-[11px] bg-muted px-2 py-1 rounded font-mono">{restUrl}</code>
                  <CopyButton value={restUrl} />
                </div>
              </SettingsRow>
              <SettingsRow label="Auth Header" description="Include this header in all requests">
                <code className="text-[11px] bg-muted px-2 py-1 rounded font-mono">x-api-key: {mcpApiKey}</code>
              </SettingsRow>
            </SettingsSection>

            <Separator />

            {/* REST Endpoints */}
            <SettingsSection title="REST API Endpoints" description="Available REST endpoints for CRUD operations">
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="divide-y divide-border text-xs">
                  {restEndpoints.map(ep => (
                    <div key={`${ep.method}-${ep.path}`} className="flex items-center gap-3 px-3 py-2">
                      <span className={`font-mono font-bold ${ep.method === "GET" ? "text-emerald-500" : ep.method === "POST" ? "text-blue-500" : ep.method === "PATCH" ? "text-amber-500" : "text-red-500"}`}>
                        {ep.method}
                      </span>
                      <code className="font-mono text-muted-foreground flex-1">{ep.path}</code>
                      <span className="text-muted-foreground">{ep.description}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Supported entities: leads, accounts, contacts, deals, projects, tasks, pilots, users, notifications, activities
              </p>
            </SettingsSection>

            <Separator />

            {/* MCP Tools */}
            <SettingsSection title="MCP Tools" description="Available tools exposed via the MCP protocol">
              <div className="rounded-lg border border-border overflow-hidden max-h-80 overflow-y-auto">
                <div className="divide-y divide-border text-xs">
                  {mcpTools.map(tool => (
                    <div key={tool.name} className="flex items-center gap-3 px-3 py-2">
                      <Terminal className="size-3.5 text-muted-foreground shrink-0" />
                      <code className="font-mono font-medium flex-1">{tool.name}</code>
                      <span className="text-muted-foreground">{tool.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SettingsSection>

            <Separator />

            {/* Setup Guide */}
            <SettingsSection title="AI Setup Guide" description="How to connect AI tools to your CRM">
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Claude Code</p>
                  <code className="text-[11px] bg-muted block px-3 py-2 rounded font-mono whitespace-pre-wrap">{`claude mcp add crm -s "${mcpUrl}" --env MCP_API_KEY=${mcpApiKey}`}</code>
                </div>
                <div>
                  <p className="font-medium mb-1">Claude Desktop</p>
                  <code className="text-[11px] bg-muted block px-3 py-2 rounded font-mono whitespace-pre-wrap">{`{
  "mcpServers": {
    "strucureo-crm": {
      "url": "${mcpUrl}",
      "headers": { "x-api-key": "${mcpApiKey}" }
    }
  }
}`}</code>
                </div>
                <div>
                  <p className="font-medium mb-1">cURL Example</p>
                  <code className="text-[11px] bg-muted block px-3 py-2 rounded font-mono whitespace-pre-wrap">{`curl ${mcpUrl} \\
  -H "x-api-key: ${mcpApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"method":"tools/list","params":{},"id":1}'`}</code>
                </div>
              </div>
            </SettingsSection>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
