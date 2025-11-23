"use client";
import { useState, useEffect } from "react";
import { Bot, Sparkles, BarChart3, Workflow, Shield, MessageCircle, Settings, Activity, Zap } from "lucide-react";
import AIChatInterface from "./AIChatInterface";

interface AIDashboardStats {
  conversationsToday: number;
  actionsCompleted: number;
  workflowsActive: number;
  safetyAlerts: number;
  userSatisfaction: number;
}

export default function AIAgentDashboard() {
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AIDashboardStats>({
    conversationsToday: 0,
    actionsCompleted: 0,
    workflowsActive: 0,
    safetyAlerts: 0,
    userSatisfaction: 0.85
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Load stats from API
      const response = await fetch('/api/ai/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load AI dashboard stats:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'conversations', label: 'Conversations', icon: MessageCircle },
    { id: 'workflows', label: 'Workflows', icon: Workflow },
    { id: 'safety', label: 'Safety', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Agent Mode</h1>
                <p className="text-sm text-gray-500">Intelligent administrative assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                AI Active
              </div>

              <button
                onClick={() => setShowChat(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <Bot className="w-4 h-4" />
                Open AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Conversations Today"
            value={stats.conversationsToday}
            icon={MessageCircle}
            color="blue"
          />
          <StatCard
            title="Actions Completed"
            value={stats.actionsCompleted}
            icon={Zap}
            color="green"
          />
          <StatCard
            title="Active Workflows"
            value={stats.workflowsActive}
            icon={Workflow}
            color="purple"
          />
          <StatCard
            title="Safety Alerts"
            value={stats.safetyAlerts}
            icon={Shield}
            color={stats.safetyAlerts > 0 ? "red" : "green"}
          />
          <StatCard
            title="User Satisfaction"
            value={`${Math.round(stats.userSatisfaction * 100)}%`}
            icon={Activity}
            color="yellow"
          />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab stats={stats} />}
            {activeTab === 'conversations' && <ConversationsTab />}
            {activeTab === 'workflows' && <WorkflowsTab />}
            {activeTab === 'safety' && <SafetyTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>

      {/* AI Chat Modal */}
      {showChat && (
        <AIChatInterface
          isOpen={showChat}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color }: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab({ stats }: { stats: AIDashboardStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Capabilities */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Capabilities</h3>
          <div className="space-y-3">
            <CapabilityItem
              icon={MessageCircle}
              title="Conversational Interface"
              description="Natural language commands and responses"
            />
            <CapabilityItem
              icon={Bot}
              title="Intelligent Form Generation"
              description="Create forms from natural language descriptions"
            />
            <CapabilityItem
              icon={BarChart3}
              title="Advanced Analytics"
              description="Conversational data analysis and insights"
            />
            <CapabilityItem
              icon={Workflow}
              title="Workflow Automation"
              description="Automated task scheduling and execution"
            />
            <CapabilityItem
              icon={Shield}
              title="Safety & Ethics"
              description="Content filtering and audit trails"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <ActivityItem
              time="2 minutes ago"
              action="Generated volunteer registration form"
              type="form"
            />
            <ActivityItem
              time="15 minutes ago"
              action="Analyzed response completion rates"
              type="analytics"
            />
            <ActivityItem
              time="1 hour ago"
              action="Created automated weekly report workflow"
              type="workflow"
            />
            <ActivityItem
              time="2 hours ago"
              action="Processed 12 new form responses"
              type="processing"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton
            title="Create Form"
            description="Generate a new form"
            icon={Bot}
            action="Create a volunteer registration form"
          />
          <QuickActionButton
            title="Run Analytics"
            description="Analyze form responses"
            icon={BarChart3}
            action="Show me analytics for form responses this month"
          />
          <QuickActionButton
            title="Set up Workflow"
            description="Create automation"
            icon={Workflow}
            action="Set up automated weekly progress reports"
          />
          <QuickActionButton
            title="Check Safety"
            description="Review AI activity"
            icon={Shield}
            action="Show me recent safety alerts"
          />
        </div>
      </div>
    </div>
  );
}

function ConversationsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">AI Conversations</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          View All Conversations
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Recent Conversations</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Session {i}</p>
                  <p className="text-sm text-gray-500">Form creation and analytics discussion</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">2 hours ago</p>
                  <p className="text-sm text-green-600">Completed</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkflowsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Automated Workflows</h3>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Create New Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WorkflowCard
          name="Volunteer Onboarding"
          description="Automated welcome emails and check-in reminders"
          status="active"
          executions={24}
          lastRun="2 hours ago"
        />
        <WorkflowCard
          name="Weekly Analytics Report"
          description="Generate and send weekly platform analytics"
          status="active"
          executions={8}
          lastRun="1 day ago"
        />
        <WorkflowCard
          name="Form Response Processing"
          description="Categorize and process new form responses"
          status="active"
          executions={156}
          lastRun="30 minutes ago"
        />
      </div>
    </div>
  );
}

function SafetyTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Safety Status</h3>
              <p className="text-sm text-gray-500">All systems normal</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Content Filtering</span>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Audit Logging</span>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Ethical Compliance</span>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Safety Checks</h3>
          <div className="space-y-3">
            <SafetyCheckItem
              check="Content Safety Scan"
              status="passed"
              time="5 minutes ago"
            />
            <SafetyCheckItem
              check="Privacy Compliance"
              status="passed"
              time="1 hour ago"
            />
            <SafetyCheckItem
              check="Bias Detection"
              status="passed"
              time="2 hours ago"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Ethical Guidelines</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Content policies enforced</p>
            <p>• Privacy rules active</p>
            <p>• Transparency maintained</p>
            <p>• User consent verified</p>
            <p>• Data handling compliant</p>
          </div>
          <button className="mt-4 text-sm text-blue-600 hover:text-blue-800">
            View Full Guidelines →
          </button>
        </div>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">AI Performance Metrics</h3>
          <div className="space-y-4">
            <MetricBar label="Response Accuracy" value={95} color="green" />
            <MetricBar label="User Satisfaction" value={85} color="blue" />
            <MetricBar label="Task Completion" value={92} color="purple" />
            <MetricBar label="Safety Compliance" value={98} color="green" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Usage Statistics</h3>
          <div className="space-y-4">
            <StatItem label="Conversations Today" value="24" />
            <StatItem label="Forms Generated" value="12" />
            <StatItem label="Reports Created" value="8" />
            <StatItem label="Workflows Executed" value="156" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">AI Agent Settings</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Style
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option>Casual and conversational</option>
              <option>Professional and formal</option>
              <option>Technical and detailed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto-Approval Threshold
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option>Low-risk actions only</option>
              <option>Medium-risk actions</option>
              <option>All actions (not recommended)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Real-time Notifications</h4>
              <p className="text-sm text-gray-500">Get notified of AI activities</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-3">
              Save Settings
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function CapabilityItem({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function ActivityItem({ time, action, type }: { time: string; action: string; type: string }) {
  const typeColors = {
    form: 'bg-blue-100 text-blue-800',
    analytics: 'bg-green-100 text-green-800',
    workflow: 'bg-purple-100 text-purple-800',
    processing: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[type as keyof typeof typeColors]}`}>
        {type}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{action}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ title, description, icon: Icon, action }: {
  title: string;
  description: string;
  icon: any;
  action: string;
}) {
  return (
    <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
      <Icon className="w-8 h-8 text-blue-600 mb-2" />
      <h4 className="font-medium text-gray-900">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}

function WorkflowCard({ name, description, status, executions, lastRun }: {
  name: string;
  description: string;
  status: string;
  executions: number;
  lastRun: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">{name}</h4>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="flex justify-between text-sm text-gray-500">
        <span>{executions} executions</span>
        <span>{lastRun}</span>
      </div>
    </div>
  );
}

function SafetyCheckItem({ check, status, time }: {
  check: string;
  status: 'passed' | 'failed';
  time: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-900">{check}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${status === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </span>
        <span className="text-sm text-gray-500">{time}</span>
      </div>
    </div>
  );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500'
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
