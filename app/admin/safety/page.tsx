"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import { getDashboardPathForRole, type UserRole } from "@/lib/auth/roles";
import { Shield, AlertTriangle, Phone, Heart, Plus, Edit3, Trash2, Search, Users, FileText, CheckCircle } from "lucide-react";
import ProfessionalButton from "@/components/ui/ProfessionalButton";

interface EmergencyContact {
  id: string;
  user_id?: string;
  volunteer_team_id?: string;
  contact_name: string;
  relationship: string;
  phone_primary: string;
  phone_secondary?: string;
  email?: string;
  medical_conditions?: string;
  allergies?: string;
  medications?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  doctor_name?: string;
  doctor_phone?: string;
  blood_type?: string;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    email: string;
  };
  volunteer_team?: {
    team_name: string;
  };
}

interface SafetyIncident {
  id: string;
  incident_type: string;
  severity: string;
  description: string;
  location?: string;
  incident_date: string;
  reported_by: string;
  affected_participants?: any[];
  actions_taken?: string;
  follow_up_required: boolean;
  follow_up_notes?: string;
  resolved: boolean;
  resolved_at?: string;
  created_at: string;
  reporter?: {
    name: string;
    email: string;
  };
}

interface SafetyChecklist {
  id: string;
  presentation_id: string;
  checklist_items: any[];
  completed_by?: string;
  completed_at?: string;
  overall_status: string;
  notes?: string;
  created_at: string;
  presentation?: {
    title: string;
    scheduled_date: string;
  };
}

export default function SafetyManagementPage() {
  const supabase = createClientComponentClient();
  const [activeTab, setActiveTab] = useState<'contacts' | 'incidents' | 'checklists'>('contacts');
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [checklists, setChecklists] = useState<SafetyChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<SafetyIncident | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddIncident, setShowAddIncident] = useState(false);

  const [newContact, setNewContact] = useState({
    user_type: 'user' as 'user' | 'volunteer_team',
    reference_id: '',
    contact_name: '',
    relationship: '',
    phone_primary: '',
    phone_secondary: '',
    email: '',
    medical_conditions: '',
    allergies: '',
    medications: '',
    insurance_provider: '',
    insurance_policy_number: '',
    doctor_name: '',
    doctor_phone: '',
    blood_type: ''
  });

  const [newIncident, setNewIncident] = useState({
    incident_type: 'medical' as const,
    severity: 'minor' as const,
    description: '',
    location: '',
    incident_date: new Date().toISOString().split('T')[0],
    actions_taken: '',
    follow_up_required: false,
    follow_up_notes: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        redirect("/login");
        return;
      }

      const { data: rows } = await supabase.from("users").select("role").eq("id", session.user.id).limit(1);
      const role = (rows?.[0]?.role as UserRole) ?? "volunteer";
      if (!['founder', 'intern'].includes(role)) {
        redirect(getDashboardPathForRole(role));
        return;
      }

      if (activeTab === 'contacts') {
        const { data: contactsData, error: contactsError } = await supabase
          .from("emergency_contacts")
          .select(`
            *,
            user:users(id, name, email),
            volunteer_team:volunteers(id, team_name)
          `)
          .order("created_at", { ascending: false });

        if (contactsError) throw contactsError;
        setContacts(contactsData || []);
      } else if (activeTab === 'incidents') {
        const { data: incidentsData, error: incidentsError } = await supabase
          .from("safety_incidents")
          .select(`
            *,
            reporter:users(id, name, email)
          `)
          .order("incident_date", { ascending: false });

        if (incidentsError) throw incidentsError;
        setIncidents(incidentsData || []);
      } else if (activeTab === 'checklists') {
        const { data: checklistsData, error: checklistsError } = await supabase
          .from("safety_checklists")
          .select(`
            *,
            presentation:presentations(id, title, scheduled_date)
          `)
          .order("created_at", { ascending: false });

        if (checklistsError) throw checklistsError;
        setChecklists(checklistsData || []);
      }
    } catch (error) {
      console.error("Error loading safety data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async () => {
    try {
      const contactData = {
        [newContact.user_type === 'user' ? 'user_id' : 'volunteer_team_id']: newContact.reference_id,
        contact_name: newContact.contact_name,
        relationship: newContact.relationship,
        phone_primary: newContact.phone_primary,
        phone_secondary: newContact.phone_secondary || null,
        email: newContact.email || null,
        medical_conditions: newContact.medical_conditions || null,
        allergies: newContact.allergies || null,
        medications: newContact.medications || null,
        insurance_provider: newContact.insurance_provider || null,
        insurance_policy_number: newContact.insurance_policy_number || null,
        doctor_name: newContact.doctor_name || null,
        doctor_phone: newContact.doctor_phone || null,
        blood_type: newContact.blood_type || null
      };

      const { error } = await supabase
        .from("emergency_contacts")
        .insert(contactData);

      if (error) throw error;

      // Reset form
      setNewContact({
        user_type: 'user',
        reference_id: '',
        contact_name: '',
        relationship: '',
        phone_primary: '',
        phone_secondary: '',
        email: '',
        medical_conditions: '',
        allergies: '',
        medications: '',
        insurance_provider: '',
        insurance_policy_number: '',
        doctor_name: '',
        doctor_phone: '',
        blood_type: ''
      });
      setShowAddContact(false);
      await loadData();
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  const addIncident = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const incidentData = {
        incident_type: newIncident.incident_type,
        severity: newIncident.severity,
        description: newIncident.description,
        location: newIncident.location || null,
        incident_date: newIncident.incident_date,
        reported_by: session.user.id,
        actions_taken: newIncident.actions_taken || null,
        follow_up_required: newIncident.follow_up_required,
        follow_up_notes: newIncident.follow_up_notes || null
      };

      const { error } = await supabase
        .from("safety_incidents")
        .insert(incidentData);

      if (error) throw error;

      // Reset form
      setNewIncident({
        incident_type: 'medical',
        severity: 'minor',
        description: '',
        location: '',
        incident_date: new Date().toISOString().split('T')[0],
        actions_taken: '',
        follow_up_required: false,
        follow_up_notes: ''
      });
      setShowAddIncident(false);
      await loadData();
    } catch (error) {
      console.error("Error adding incident:", error);
    }
  };

  const updateIncidentStatus = async (incidentId: string, resolved: boolean) => {
    try {
      const updateData: any = { resolved };
      if (resolved) {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("safety_incidents")
        .update(updateData)
        .eq("id", incidentId);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error("Error updating incident:", error);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase();
    return contact.contact_name.toLowerCase().includes(searchLower) ||
           contact.relationship.toLowerCase().includes(searchLower) ||
           contact.phone_primary.includes(searchTerm) ||
           contact.user?.name?.toLowerCase().includes(searchLower) ||
           contact.volunteer_team?.team_name?.toLowerCase().includes(searchLower);
  });

  const filteredIncidents = incidents.filter(incident => {
    const searchLower = searchTerm.toLowerCase();
    return incident.description.toLowerCase().includes(searchLower) ||
           incident.incident_type.toLowerCase().includes(searchLower) ||
           incident.location?.toLowerCase().includes(searchLower);
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800";
      case "serious": return "bg-orange-100 text-orange-800";
      case "moderate": return "bg-yellow-100 text-yellow-800";
      case "minor": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getIncidentTypeIcon = (type: string) => {
    switch (type) {
      case "medical": return <Heart className="w-4 h-4" />;
      case "environmental": return <AlertTriangle className="w-4 h-4" />;
      case "equipment": return <Shield className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center py-12 text-gsv-gray">Loading safety data...</div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gsv-charcoal mb-2">Safety & Emergency Management</h1>
          <p className="text-gsv-gray">
            Manage emergency contacts, incident reports, and safety protocols
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="text-2xl font-bold text-blue-600">{contacts.length}</div>
            <div className="text-sm text-gsv-gray">Emergency Contacts</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-red-600">
              {incidents.filter(i => !i.resolved).length}
            </div>
            <div className="text-sm text-gsv-gray">Open Incidents</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-green-600">
              {incidents.filter(i => i.resolved).length}
            </div>
            <div className="text-sm text-gsv-gray">Resolved Incidents</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-purple-600">
              {checklists.filter(c => c.overall_status === 'completed').length}
            </div>
            <div className="text-sm text-gsv-gray">Safety Checks Completed</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card p-4 mb-6">
          <div className="flex space-x-1">
            {[
              { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
              { id: 'incidents', label: 'Incident Reports', icon: AlertTriangle },
              { id: 'checklists', label: 'Safety Checklists', icon: Shield }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-gsv-green text-white'
                    : 'text-gsv-gray hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Actions */}
        <div className="card p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gsv-gray w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
              />
            </div>

            <div className="flex gap-2">
              {activeTab === 'contacts' && (
                <ProfessionalButton
                  onClick={() => setShowAddContact(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Contact
                </ProfessionalButton>
              )}
              {activeTab === 'incidents' && (
                <ProfessionalButton
                  onClick={() => setShowAddIncident(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Report Incident
                </ProfessionalButton>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                      Person/Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                      Medical Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gsv-charcoal">
                            {contact.contact_name}
                          </div>
                          <div className="text-sm text-gsv-gray">
                            {contact.relationship}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gsv-gray">
                          {contact.user?.name || contact.volunteer_team?.team_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gsv-charcoal">
                              {contact.phone_primary}
                            </div>
                            {contact.phone_secondary && (
                              <div className="text-sm text-gsv-gray">
                                Alt: {contact.phone_secondary}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gsv-gray">
                          {contact.medical_conditions && (
                            <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Conditions present
                            </div>
                          )}
                          {contact.allergies && (
                            <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mt-1">
                              Allergies noted
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="text-gsv-green hover:text-gsv-green/80"
                          title="View Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredContacts.length === 0 && (
              <div className="text-center py-12 text-gsv-gray">
                No emergency contacts found.
              </div>
            )}
          </div>
        )}

        {/* Incident Reports Tab */}
        {activeTab === 'incidents' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                      Incident
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gsv-charcoal uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredIncidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {getIncidentTypeIcon(incident.incident_type)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gsv-charcoal capitalize">
                              {incident.incident_type}
                            </div>
                            <div className="text-sm text-gsv-gray line-clamp-2">
                              {incident.description}
                            </div>
                            {incident.location && (
                              <div className="text-xs text-gsv-gray mt-1">
                                📍 {incident.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gsv-gray">
                        {new Date(incident.incident_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {incident.resolved ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Resolved
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Open
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedIncident(incident)}
                            className="text-gsv-green hover:text-gsv-green/80"
                            title="View Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {!incident.resolved && (
                            <button
                              onClick={() => updateIncidentStatus(incident.id, true)}
                              className="text-green-600 hover:text-green-600/80"
                              title="Mark Resolved"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredIncidents.length === 0 && (
              <div className="text-center py-12 text-gsv-gray">
                No incident reports found.
              </div>
            )}
          </div>
        )}

        {/* Safety Checklists Tab */}
        {activeTab === 'checklists' && (
          <div className="space-y-4">
            {checklists.map((checklist) => (
              <div key={checklist.id} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gsv-charcoal">
                      {checklist.presentation?.title || 'Presentation Safety Check'}
                    </h3>
                    <p className="text-sm text-gsv-gray">
                      {checklist.presentation?.scheduled_date
                        ? new Date(checklist.presentation.scheduled_date).toLocaleDateString()
                        : 'Date not set'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    checklist.overall_status === 'completed' ? 'bg-green-100 text-green-800' :
                    checklist.overall_status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {checklist.overall_status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gsv-charcoal mb-2">Checklist Items</h4>
                    <div className="space-y-2">
                      {Array.isArray(checklist.checklist_items) && checklist.checklist_items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.completed || false}
                            readOnly
                            className="rounded border-gray-300"
                          />
                          <span className={`text-sm ${item.completed ? 'line-through text-gsv-gray' : 'text-gsv-charcoal'}`}>
                            {item.text || item.title || `Item ${index + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {checklist.notes && (
                    <div>
                      <h4 className="font-medium text-gsv-charcoal mb-2">Notes</h4>
                      <p className="text-sm text-gsv-gray">{checklist.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {checklists.length === 0 && (
              <div className="card p-12 text-center text-gsv-gray">
                No safety checklists found.
              </div>
            )}
          </div>
        )}

        {/* Add Contact Modal */}
        {showAddContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gsv-charcoal">Add Emergency Contact</h3>
              </div>
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                        Contact Type
                      </label>
                      <select
                        value={newContact.user_type}
                        onChange={(e) => setNewContact(prev => ({ ...prev, user_type: e.target.value as 'user' | 'volunteer_team' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                      >
                        <option value="user">Individual User</option>
                        <option value="volunteer_team">Volunteer Team</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={newContact.contact_name}
                        onChange={(e) => setNewContact(prev => ({ ...prev, contact_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                        placeholder="Full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                        Relationship *
                      </label>
                      <input
                        type="text"
                        value={newContact.relationship}
                        onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                        placeholder="e.g., Parent, Spouse, Guardian"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                        Primary Phone *
                      </label>
                      <input
                        type="tel"
                        value={newContact.phone_primary}
                        onChange={(e) => setNewContact(prev => ({ ...prev, phone_primary: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                        Secondary Phone
                      </label>
                      <input
                        type="tel"
                        value={newContact.phone_secondary}
                        onChange={(e) => setNewContact(prev => ({ ...prev, phone_secondary: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                        placeholder="(555) 987-6543"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gsv-charcoal">Medical Information</h4>

                    <div>
                      <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                        Medical Conditions
                      </label>
                      <textarea
                        value={newContact.medical_conditions}
                        onChange={(e) => setNewContact(prev => ({ ...prev, medical_conditions: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green resize-none"
                        rows={2}
                        placeholder="Any medical conditions..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                        Allergies
                      </label>
                      <textarea
                        value={newContact.allergies}
                        onChange={(e) => setNewContact(prev => ({ ...prev, allergies: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green resize-none"
                        rows={2}
                        placeholder="Known allergies..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                        Current Medications
                      </label>
                      <textarea
                        value={newContact.medications}
                        onChange={(e) => setNewContact(prev => ({ ...prev, medications: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green resize-none"
                        rows={2}
                        placeholder="Current medications..."
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                          Blood Type
                        </label>
                        <select
                          value={newContact.blood_type}
                          onChange={(e) => setNewContact(prev => ({ ...prev, blood_type: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                        >
                          <option value="">Unknown</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => setShowAddContact(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <ProfessionalButton
                  onClick={addContact}
                  disabled={!newContact.contact_name || !newContact.relationship || !newContact.phone_primary}
                >
                  Add Contact
                </ProfessionalButton>
              </div>
            </div>
          </div>
        )}

        {/* Add Incident Modal */}
        {showAddIncident && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gsv-charcoal">Report Safety Incident</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                    Incident Type *
                  </label>
                  <select
                    value={newIncident.incident_type}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, incident_type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                  >
                    <option value="medical">Medical</option>
                    <option value="environmental">Environmental</option>
                    <option value="equipment">Equipment</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                    Severity *
                  </label>
                  <select
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, severity: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                  >
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="serious">Serious</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                    Description *
                  </label>
                  <textarea
                    value={newIncident.description}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green resize-none"
                    rows={4}
                    placeholder="Describe what happened..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newIncident.location}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                    placeholder="Where did this occur?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newIncident.incident_date}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, incident_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                    Actions Taken
                  </label>
                  <textarea
                    value={newIncident.actions_taken}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, actions_taken: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green resize-none"
                    rows={3}
                    placeholder="What was done to address this incident?"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="follow_up_required"
                    checked={newIncident.follow_up_required}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, follow_up_required: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="follow_up_required" className="text-sm font-medium text-gsv-charcoal">
                    Follow-up required
                  </label>
                </div>

                {newIncident.follow_up_required && (
                  <div>
                    <label className="block text-sm font-medium text-gsv-charcoal mb-1">
                      Follow-up Notes
                    </label>
                    <textarea
                      value={newIncident.follow_up_notes}
                      onChange={(e) => setNewIncident(prev => ({ ...prev, follow_up_notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gsv-green resize-none"
                      rows={2}
                      placeholder="What follow-up is needed?"
                    />
                  </div>
                )}
              </div>
              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => setShowAddIncident(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <ProfessionalButton
                  onClick={addIncident}
                  disabled={!newIncident.description}
                >
                  Report Incident
                </ProfessionalButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
