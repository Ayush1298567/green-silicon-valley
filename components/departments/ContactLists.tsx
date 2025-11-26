"use client";

import { useState, useEffect } from "react";
import { Users, Mail, Phone, MapPin, Plus, Edit, Trash2 } from "lucide-react";

interface DepartmentContact {
  id: string;
  department: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  organization?: string;
  notes?: string;
  contact_type: "internal" | "external" | "partner";
}

interface ContactListsProps {
  departmentId: string;
}

export default function ContactLists({ departmentId }: ContactListsProps) {
  const [contacts, setContacts] = useState<DepartmentContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    fetchContacts();
  }, [departmentId]);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`/api/departments/${departmentId}/contacts`);
      const data = await res.json();
      if (data.ok) {
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    selectedType === "all" || contact.contact_type === selectedType
  );

  const getContactTypeBadge = (type: string) => {
    switch (type) {
      case "internal":
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Internal</span>;
      case "external":
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">External</span>;
      case "partner":
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Partner</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Department Contacts</h2>
          <p className="text-gray-600">Manage internal and external contacts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={16} />
          Add Contact
        </button>
      </div>

      <div className="flex gap-2">
        {["all", "internal", "external", "partner"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              selectedType === type
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {type} ({type === "all" ? contacts.length : contacts.filter(c => c.contact_type === type).length})
          </button>
        ))}
      </div>

      {filteredContacts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No contacts found</h3>
          <p>Start by adding your first department contact</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContacts.map((contact) => (
            <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-600">{contact.role}</p>
                  {contact.organization && (
                    <p className="text-sm text-gray-600">{contact.organization}</p>
                  )}
                </div>
                {getContactTypeBadge(contact.contact_type)}
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <a href={`tel:${contact.phone}`} className="text-blue-600 hover:text-blue-800">
                      {contact.phone}
                    </a>
                  </div>
                )}
              </div>

              {contact.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600">{contact.notes}</p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-800 text-sm">
                  <Edit size={14} />
                  Edit
                </button>
                <button className="flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-800 text-sm">
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
