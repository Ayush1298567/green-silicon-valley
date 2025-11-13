"use client";
import { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Save, RefreshCw, Eye, Edit3, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProfessionalButton from "@/components/ui/ProfessionalButton";

interface ContentBlock {
  id: string;
  page: string;
  block_key: string;
  content: string;
  updated_at: string;
}

const PAGES = [
  { value: "home", label: "Home Page" },
  { value: "about", label: "About Page" },
  { value: "impact", label: "Impact Page" },
  { value: "get-involved", label: "Get Involved" },
  { value: "contact", label: "Contact Page" }
];

export default function ContentEditorPage() {
  const [selectedPage, setSelectedPage] = useState("home");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const supabase = createClientComponentClient();

  const loadBlocks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("content_blocks")
        .select("*")
        .eq("page", selectedPage)
        .order("block_key");

      if (error) throw error;

      setBlocks(data ?? []);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message ?? "Failed to load content blocks" });
    } finally {
      setLoading(false);
    }
  }, [selectedPage, supabase]);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  async function saveBlock(blockId: string, content: string) {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("content_blocks")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", blockId);

      if (error) throw error;

      showMessage("success", "Content saved successfully!");
      loadBlocks();
      setEditingBlock(null);
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setSaving(false);
    }
  }

  async function createBlock() {
    const blockKey = prompt("Enter block key (e.g., hero_title, about_description):");
    if (!blockKey) return;

    const content = prompt("Enter initial content:");
    if (!content) return;

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("content_blocks").insert({
        page: selectedPage,
        block_key: blockKey,
        content: content,
        updated_by: user?.id
      });

      if (error) throw error;

      showMessage("success", "Block created successfully!");
      loadBlocks();
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteBlock(blockId: string) {
    if (!confirm("Delete this content block?")) return;

    try {
      const { error } = await supabase
        .from("content_blocks")
        .delete()
        .eq("id", blockId);

      if (error) throw error;

      showMessage("success", "Block deleted!");
      loadBlocks();
    } catch (error: any) {
      showMessage("error", error.message);
    }
  }

  function startEditing(block: ContentBlock) {
    setEditingBlock(block.id);
    setEditContent(block.content);
  }

  function cancelEditing() {
    setEditingBlock(null);
    setEditContent("");
  }

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  return (
    <div className="min-h-screen bg-gsv-slate-100 py-12">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gsv-charcoal mb-2">Visual Content Editor</h1>
          <p className="text-gsv-slate-600">Edit website content without touching code</p>
        </div>

        {/* Message Toast */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl ${
                message.type === "success"
                  ? "bg-accent-success/10 text-accent-success border border-accent-success/20"
                  : "bg-accent-error/10 text-accent-error border border-accent-error/20"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Page Selector */}
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-semibold text-gsv-slate-700 mb-2">
                Select Page
              </label>
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full px-4 py-3 border border-gsv-slate-300 rounded-xl focus:ring-2 focus:ring-gsv-green focus:border-transparent transition-all"
              >
                {PAGES.map((page) => (
                  <option key={page.value} value={page.value}>
                    {page.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <ProfessionalButton
                variant="secondary"
                size="md"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={loadBlocks}
              >
                Refresh
              </ProfessionalButton>
              <ProfessionalButton
                variant="secondary"
                size="md"
                icon={previewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? "Edit Mode" : "Preview"}
              </ProfessionalButton>
              <ProfessionalButton
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                onClick={createBlock}
              >
                Add Block
              </ProfessionalButton>
            </div>
          </div>
        </div>

        {/* Content Blocks */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-gsv-green border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gsv-slate-600">Loading content blocks...</p>
          </div>
        ) : blocks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gsv-slate-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gsv-slate-700 mb-2">No content blocks yet</p>
            <p className="text-sm text-gsv-slate-500 mb-6">Create your first content block to get started</p>
            <ProfessionalButton
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={createBlock}
            >
              Create First Block
            </ProfessionalButton>
          </div>
        ) : (
          <div className="space-y-6">
            {blocks.map((block, index) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-soft overflow-hidden"
              >
                {/* Block Header */}
                <div className="bg-gsv-slate-50 px-6 py-4 border-b border-gsv-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gsv-charcoal">{block.block_key}</h3>
                    <p className="text-sm text-gsv-slate-500">
                      Last updated: {new Date(block.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {editingBlock === block.id ? (
                      <>
                        <ProfessionalButton
                          variant="primary"
                          size="sm"
                          icon={<Save className="w-4 h-4" />}
                          onClick={() => saveBlock(block.id, editContent)}
                          loading={saving}
                        >
                          Save
                        </ProfessionalButton>
                        <ProfessionalButton
                          variant="ghost"
                          size="sm"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </ProfessionalButton>
                      </>
                    ) : (
                      <>
                        <ProfessionalButton
                          variant="secondary"
                          size="sm"
                          icon={<Edit3 className="w-4 h-4" />}
                          onClick={() => startEditing(block)}
                        >
                          Edit
                        </ProfessionalButton>
                        <ProfessionalButton
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => deleteBlock(block.id)}
                          className="text-accent-error hover:bg-accent-error/10"
                        >
                          Delete
                        </ProfessionalButton>
                      </>
                    )}
                  </div>
                </div>

                {/* Block Content */}
                <div className="p-6">
                  {editingBlock === block.id ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gsv-slate-300 rounded-xl focus:ring-2 focus:ring-gsv-green focus:border-transparent transition-all font-mono text-sm"
                      placeholder="Enter content..."
                    />
                  ) : previewMode ? (
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: block.content }} />
                    </div>
                  ) : (
                    <div className="bg-gsv-slate-50 rounded-xl p-4 font-mono text-sm text-gsv-slate-700 whitespace-pre-wrap">
                      {block.content}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-br from-gsv-greenSoft to-gsv-warmSoft rounded-2xl p-8 border border-gsv-green/20">
          <h3 className="text-xl font-bold text-gsv-charcoal mb-4">💡 How to Use</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gsv-slate-700">
            <div>
              <h4 className="font-semibold mb-2">Editing Content</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Click “Edit” to modify any content block</li>
                <li>Make your changes in the text area</li>
                <li>Click “Save” to apply changes</li>
                <li>Changes appear immediately on the website</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Managing Blocks</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Use “Add Block” to create new content</li>
                <li>Block keys identify where content appears</li>
                <li>Delete unused blocks to keep things tidy</li>
                <li>Use “Preview” to see formatted content</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">HTML Support</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>You can use HTML tags in content</li>
                <li>Use &lt;strong&gt; for bold text</li>
                <li>Use &lt;em&gt; for italic text</li>
                <li>Use &lt;br&gt; for line breaks</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Best Practices</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Keep block keys descriptive</li>
                <li>Test changes in preview mode</li>
                <li>Save frequently while editing</li>
                <li>Use consistent formatting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

