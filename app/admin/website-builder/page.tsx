"use client";
import { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { 
  Layout, Save, Eye, Plus, Trash2, Edit3, Move, Settings, 
  Image as ImageIcon, Type, Square, Columns, Grid3x3, Palette,
  ArrowUp, ArrowDown, Copy, Undo, Redo, Download, Upload
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import ProfessionalButton from "@/components/ui/ProfessionalButton";
import ImageUploader from "@/components/website-builder/ImageUploader";
import GalleryManager from "@/components/website-builder/GalleryManager";
import WebsiteBuilderLockManager from "@/components/website-builder/WebsiteBuilderLockManager";

interface PageSection {
  id: string;
  type: string;
  title: string;
  content: any;
  order: number;
  visible: boolean;
  settings: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    layout?: string;
  };
}

interface WebsiteSettings {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoUrl: string;
  socialLinks: {
    platform: string;
    url: string;
  }[];
}

const SECTION_TYPES = [
  { value: "hero", label: "Hero Section", icon: Layout, description: "Large header with image/video" },
  { value: "text", label: "Text Block", icon: Type, description: "Rich text content" },
  { value: "image", label: "Image", icon: ImageIcon, description: "Single image or gallery" },
  { value: "grid", label: "Grid Layout", icon: Grid3x3, description: "Multi-column grid" },
  { value: "columns", label: "Columns", icon: Columns, description: "Side-by-side content" },
  { value: "cta", label: "Call to Action", icon: Square, description: "Button with message" },
  { value: "form", label: "Form", icon: Edit3, description: "Contact or signup form" },
  { value: "social", label: "Social Media", icon: Settings, description: "Social media links" }
];

export default function WebsiteBuilderPage() {
  const [selectedPage, setSelectedPage] = useState("home");
  const [sections, setSections] = useState<PageSection[]>([]);
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>({
    primaryColor: "#2D7A4F",
    secondaryColor: "#D97642",
    fontFamily: "Inter",
    logoUrl: "/logo.svg",
    socialLinks: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [history, setHistory] = useState<PageSection[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const supabase = createClientComponentClient();

  const loadPageSections = useCallback(async () => {
    try {
      setLoading(true);
      // Load sections from database
      const { data, error } = await supabase
        .from("page_sections")
        .select("*")
        .eq("page", selectedPage)
        .order("order");

      if (error) throw error;

      if (data && data.length > 0) {
        setSections(data);
      } else {
        // Default sections for new pages
        setSections([
          {
            id: "hero-1",
            type: "hero",
            title: "Hero Section",
            content: { headline: "Welcome", subtitle: "Your message here" },
            order: 0,
            visible: true,
            settings: { backgroundColor: "#1A1A1A", textColor: "#FFFFFF", padding: "large" }
          }
        ]);
      }
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedPage, supabase]);

  const loadWebsiteSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("website_settings")
        .select("*")
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setWebsiteSettings(data.settings);
    } catch (error: any) {
      console.error("Settings load error:", error);
    }
  }, [supabase]);

  useEffect(() => {
    loadPageSections();
    loadWebsiteSettings();
  }, [loadPageSections, loadWebsiteSettings]);

  async function savePage() {
    try {
      setSaving(true);

      // Save sections
      for (const section of sections) {
        const { error } = await supabase
          .from("page_sections")
          .upsert({
            id: section.id,
            page: selectedPage,
            type: section.type,
            title: section.title,
            content: section.content,
            order: section.order,
            visible: section.visible,
            settings: section.settings
          });

        if (error) throw error;
      }

      // Save website settings
      const { error: settingsError } = await supabase
        .from("website_settings")
        .upsert({
          id: 1,
          settings: websiteSettings,
          updated_at: new Date().toISOString()
        });

      if (settingsError) throw settingsError;

      showMessage("success", "Page saved successfully!");
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setSaving(false);
    }
  }

  function addSection(type: string) {
    const newSection: PageSection = {
      id: `${type}-${Date.now()}`,
      type,
      title: `New ${type} Section`,
      content: {},
      order: sections.length,
      visible: true,
      settings: {}
    };

    const newSections = [...sections, newSection];
    setSections(newSections);
    addToHistory(newSections);
    setShowAddSection(false);
    setEditingSection(newSection.id);
  }

  function deleteSection(id: string) {
    if (!confirm("Delete this section?")) return;
    const newSections = sections.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i }));
    setSections(newSections);
    addToHistory(newSections);
  }

  function duplicateSection(id: string) {
    const section = sections.find(s => s.id === id);
    if (!section) return;

    const newSection = {
      ...section,
      id: `${section.type}-${Date.now()}`,
      order: section.order + 1
    };

    const newSections = [
      ...sections.slice(0, section.order + 1),
      newSection,
      ...sections.slice(section.order + 1)
    ].map((s, i) => ({ ...s, order: i }));

    setSections(newSections);
    addToHistory(newSections);
  }

  function moveSection(id: string, direction: "up" | "down") {
    const index = sections.findIndex(s => s.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sections.length - 1) return;

    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    
    const reordered = newSections.map((s, i) => ({ ...s, order: i }));
    setSections(reordered);
    addToHistory(reordered);
  }

  function toggleVisibility(id: string) {
    const newSections = sections.map(s =>
      s.id === id ? { ...s, visible: !s.visible } : s
    );
    setSections(newSections);
    addToHistory(newSections);
  }

  function updateSection(id: string, updates: Partial<PageSection>) {
    const newSections = sections.map(s =>
      s.id === id ? { ...s, ...updates } : s
    );
    setSections(newSections);
    addToHistory(newSections);
  }

  function addToHistory(newSections: PageSection[]) {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newSections)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }

  function undo() {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSections(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSections(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  }

  function exportPage() {
    const data = {
      page: selectedPage,
      sections,
      settings: websiteSettings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedPage}-page.json`;
    a.click();
  }

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  return (
    <div className="min-h-screen bg-gsv-slate-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-gsv-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container max-w-7xl py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gsv-charcoal">Website Builder</h1>
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="px-4 py-2 border border-gsv-slate-300 rounded-lg focus:ring-2 focus:ring-gsv-green focus:border-transparent"
              >
                <option value="home">Home Page</option>
                <option value="about">About Page</option>
                <option value="impact">Impact Page</option>
                <option value="get-involved">Get Involved</option>
                <option value="contact">Contact Page</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 text-gsv-slate-600 hover:text-gsv-green hover:bg-gsv-slate-100 rounded-lg transition-colors disabled:opacity-30"
                title="Undo"
              >
                <Undo className="w-5 h-5" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 text-gsv-slate-600 hover:text-gsv-green hover:bg-gsv-slate-100 rounded-lg transition-colors disabled:opacity-30"
                title="Redo"
              >
                <Redo className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-gsv-slate-300" />
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  previewMode
                    ? "bg-gsv-green text-white"
                    : "text-gsv-slate-700 hover:bg-gsv-slate-100"
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                {previewMode ? "Edit Mode" : "Preview"}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 text-gsv-slate-700 hover:bg-gsv-slate-100 rounded-lg font-medium transition-colors"
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Settings
              </button>
              <button
                onClick={exportPage}
                className="px-4 py-2 text-gsv-slate-700 hover:bg-gsv-slate-100 rounded-lg font-medium transition-colors"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Export
              </button>
              <ProfessionalButton
                variant="primary"
                size="md"
                icon={<Save className="w-4 h-4" />}
                onClick={savePage}
                loading={saving}
              >
                Save Page
              </ProfessionalButton>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Lock Manager */}
      <WebsiteBuilderLockManager
        pageId={selectedPage}
        onLockStatusChange={(canEdit, lockInfo) => {
          // Could disable editing controls when locked
        }}
      />

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-4 z-50 p-4 rounded-xl shadow-xl ${
              message.type === "success"
                ? "bg-accent-success/10 text-accent-success border border-accent-success/20"
                : "bg-accent-error/10 text-accent-error border border-accent-error/20"
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container max-w-7xl py-8">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-gsv-green border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gsv-slate-600">Loading page builder...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sections List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gsv-charcoal">Sections</h3>
                  <button
                    onClick={() => setShowAddSection(true)}
                    className="p-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <Reorder.Group
                  axis="y"
                  values={sections}
                  onReorder={setSections}
                  className="space-y-2"
                >
                  {sections.map((section) => (
                    <Reorder.Item key={section.id} value={section}>
                      <div
                        className={`p-3 rounded-lg border-2 cursor-move transition-all ${
                          editingSection === section.id
                            ? "border-gsv-green bg-gsv-greenSoft"
                            : "border-gsv-slate-200 hover:border-gsv-green/50"
                        } ${!section.visible ? "opacity-50" : ""}`}
                        onClick={() => setEditingSection(section.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Move className="w-4 h-4 text-gsv-slate-400" />
                            <span className="text-sm font-medium text-gsv-charcoal">
                              {section.title}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVisibility(section.id);
                            }}
                            className="text-gsv-slate-400 hover:text-gsv-green"
                          >
                            <Eye className={`w-4 h-4 ${!section.visible ? "opacity-30" : ""}`} />
                          </button>
                        </div>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            </div>

            {/* Editor Area */}
            <div className="lg:col-span-3">
              {editingSection ? (
                <SectionEditor
                  section={sections.find(s => s.id === editingSection)!}
                  onUpdate={(updates) => updateSection(editingSection, updates)}
                  onDelete={() => {
                    deleteSection(editingSection);
                    setEditingSection(null);
                  }}
                  onDuplicate={() => duplicateSection(editingSection)}
                  onMoveUp={() => moveSection(editingSection, "up")}
                  onMoveDown={() => moveSection(editingSection, "down")}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
                  <Layout className="w-16 h-16 text-gsv-slate-300 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gsv-slate-700 mb-2">
                    Select a section to edit
                  </p>
                  <p className="text-sm text-gsv-slate-500">
                    Click on a section from the list or add a new one
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Section Modal */}
      <AnimatePresence>
        {showAddSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal flex items-center justify-center p-4"
            onClick={() => setShowAddSection(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-auto p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-gsv-charcoal mb-6">Add Section</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {SECTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => addSection(type.value)}
                    className="p-6 border-2 border-gsv-slate-200 rounded-xl hover:border-gsv-green hover:bg-gsv-greenSoft transition-all text-left group"
                  >
                    <type.icon className="w-8 h-8 text-gsv-green mb-3" />
                    <h3 className="font-bold text-gsv-charcoal mb-2 group-hover:text-gsv-green transition-colors">
                      {type.label}
                    </h3>
                    <p className="text-sm text-gsv-slate-600">{type.description}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Section Editor Component
function SectionEditor({
  section,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown
}: {
  section: PageSection;
  onUpdate: (updates: Partial<PageSection>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
      {/* Header */}
      <div className="bg-gsv-slate-50 px-6 py-4 border-b border-gsv-slate-200 flex items-center justify-between">
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="text-xl font-bold text-gsv-charcoal bg-transparent border-none outline-none"
        />
        <div className="flex gap-2">
          <button onClick={onMoveUp} className="p-2 hover:bg-gsv-slate-200 rounded-lg">
            <ArrowUp className="w-4 h-4" />
          </button>
          <button onClick={onMoveDown} className="p-2 hover:bg-gsv-slate-200 rounded-lg">
            <ArrowDown className="w-4 h-4" />
          </button>
          <button onClick={onDuplicate} className="p-2 hover:bg-gsv-slate-200 rounded-lg">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-2 hover:bg-red-100 text-accent-error rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Layout Settings */}
        <div>
          <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
            Layout
          </label>
          <select
            value={section.settings.layout || "default"}
            onChange={(e) => onUpdate({
              settings: { ...section.settings, layout: e.target.value }
            })}
            className="w-full px-4 py-2 border border-gsv-slate-300 rounded-lg"
          >
            <option value="default">Default</option>
            <option value="full-width">Full Width</option>
            <option value="container">Container</option>
            <option value="narrow">Narrow</option>
            <option value="split">Split (50/50)</option>
            <option value="sidebar">Sidebar Layout</option>
          </select>
        </div>

        {/* Background Color */}
        <div>
          <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
            Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={section.settings.backgroundColor || "#FFFFFF"}
              onChange={(e) => onUpdate({
                settings: { ...section.settings, backgroundColor: e.target.value }
              })}
              className="w-12 h-12 rounded-lg border-2 border-gsv-slate-300 cursor-pointer"
            />
            <input
              type="text"
              value={section.settings.backgroundColor || "#FFFFFF"}
              onChange={(e) => onUpdate({
                settings: { ...section.settings, backgroundColor: e.target.value }
              })}
              className="flex-1 px-4 py-2 border border-gsv-slate-300 rounded-lg"
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
            Text Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={section.settings.textColor || "#000000"}
              onChange={(e) => onUpdate({
                settings: { ...section.settings, textColor: e.target.value }
              })}
              className="w-12 h-12 rounded-lg border-2 border-gsv-slate-300 cursor-pointer"
            />
            <input
              type="text"
              value={section.settings.textColor || "#000000"}
              onChange={(e) => onUpdate({
                settings: { ...section.settings, textColor: e.target.value }
              })}
              className="flex-1 px-4 py-2 border border-gsv-slate-300 rounded-lg"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Padding */}
        <div>
          <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
            Padding
          </label>
          <select
            value={section.settings.padding || "medium"}
            onChange={(e) => onUpdate({
              settings: { ...section.settings, padding: e.target.value }
            })}
            className="w-full px-4 py-2 border border-gsv-slate-300 rounded-lg"
          >
            <option value="none">None</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="xlarge">Extra Large</option>
          </select>
        </div>

        {/* Section-Specific Content */}
        {section.type === "image" && (
          <div>
            <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
              Image
            </label>
            <ImageUploader
              currentUrl={section.content.imageUrl}
              onUploadComplete={(url) => onUpdate({
                content: { ...section.content, imageUrl: url }
              })}
              folder="website-images"
            />
            <div className="mt-2">
              <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
                Alt Text
              </label>
              <input
                type="text"
                value={section.content.altText || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, altText: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gsv-slate-300 rounded-lg"
                placeholder="Image description"
              />
            </div>
          </div>
        )}

        {section.type === "hero" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
                Background Image
              </label>
              <ImageUploader
                currentUrl={section.content.backgroundImage}
                onUploadComplete={(url) => onUpdate({
                  content: { ...section.content, backgroundImage: url }
                })}
                folder="hero-images"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
                Headline
              </label>
              <input
                type="text"
                value={section.content.headline || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, headline: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gsv-slate-300 rounded-lg"
                placeholder="Main headline"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
                Subtitle
              </label>
              <textarea
                value={section.content.subtitle || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, subtitle: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gsv-slate-300 rounded-lg"
                rows={3}
                placeholder="Supporting text"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
                CTA Button Text
              </label>
              <input
                type="text"
                value={section.content.ctaText || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, ctaText: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gsv-slate-300 rounded-lg"
                placeholder="Get Started"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
                CTA Button Link
              </label>
              <input
                type="text"
                value={section.content.ctaLink || ""}
                onChange={(e) => onUpdate({
                  content: { ...section.content, ctaLink: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gsv-slate-300 rounded-lg"
                placeholder="/get-involved"
              />
            </div>
          </div>
        )}

        {section.type === "grid" && (
          <div>
            <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
              Gallery Images
            </label>
            <GalleryManager
              images={section.content.images || []}
              onImagesChange={(images) => onUpdate({
                content: { ...section.content, images }
              })}
            />
          </div>
        )}

        {section.type === "text" && (
          <div>
            <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
              Text Content
            </label>
            <textarea
              value={section.content.text || ""}
              onChange={(e) => onUpdate({
                content: { ...section.content, text: e.target.value }
              })}
              rows={10}
              className="w-full px-4 py-3 border border-gsv-slate-300 rounded-lg"
              placeholder="Enter your text content here..."
            />
            <p className="text-xs text-gsv-slate-500 mt-1">
              Supports Markdown formatting
            </p>
          </div>
        )}

        {/* Advanced JSON Editor (for all types) */}
        <details className="border-t pt-4">
          <summary className="cursor-pointer text-sm font-semibold text-gsv-slate-700 mb-2">
            Advanced (JSON Editor)
          </summary>
          <textarea
            value={JSON.stringify(section.content, null, 2)}
            onChange={(e) => {
              try {
                onUpdate({ content: JSON.parse(e.target.value) });
              } catch {}
            }}
            rows={10}
            className="w-full px-4 py-3 border border-gsv-slate-300 rounded-lg font-mono text-sm mt-2"
          />
        </details>
      </div>
    </div>
  );
}

