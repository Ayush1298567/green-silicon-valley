"use client";

import { useState, useEffect } from "react";
import { 
  Save, Eye, Code, Layout, Type, Image as ImageIcon, 
  Plus, Trash2, ArrowLeft, Settings, Layers, FileText
} from "lucide-react";
import PageEditorPanel from "./PageEditorPanel";
import ContentBlockEditor from "./ContentBlockEditor";
import PagePreview from "./PagePreview";

interface Page {
  id: string;
  page_name: string;
  page_path: string;
  template_type: string;
  layout_config: any;
  is_editable: boolean;
}

interface ContentBlock {
  id: number;
  key: string;
  title: string | null;
  content: string | null;
  html_content: string | null;
  page_section: string | null;
  display_order: number;
  is_published: boolean;
  css_classes: string | null;
}

interface Props {
  initialPages: Page[];
  initialContentBlocks: ContentBlock[];
  currentUserId: string;
}

export default function PageBuilderInterface({ initialPages, initialContentBlocks, currentUserId }: Props) {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(initialContentBlocks);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);
  const [view, setView] = useState<"list" | "edit" | "preview">("list");
  const [editMode, setEditMode] = useState<"visual" | "code">("visual");
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleSaveBlock = async (blockData: Partial<ContentBlock>) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/page-builder/content-blocks/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blockData),
      });

      if (response.ok) {
        const { block } = await response.json();
        setContentBlocks(prevBlocks => {
          const existingIndex = prevBlocks.findIndex(b => b.id === block.id);
          if (existingIndex >= 0) {
            const updated = [...prevBlocks];
            updated[existingIndex] = block;
            return updated;
          }
          return [...prevBlocks, block];
        });
        alert("Content saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save content:", error);
      alert("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishBlock = async (blockId: number, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/page-builder/content-blocks/${blockId}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: isPublished }),
      });

      if (response.ok) {
        setContentBlocks(prevBlocks => 
          prevBlocks.map(b => b.id === blockId ? { ...b, is_published: isPublished } : b)
        );
      }
    } catch (error) {
      console.error("Failed to publish block:", error);
    }
  };

  const handleCreatePage = async () => {
    const pageName = prompt("Enter page name:");
    if (!pageName) return;

    const pagePath = "/" + pageName.toLowerCase().replace(/\s+/g, "-");

    try {
      const response = await fetch("/api/page-builder/pages/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_name: pageName,
          page_path: pagePath,
          template_type: "static",
        }),
      });

      if (response.ok) {
        const { page } = await response.json();
        setPages([...pages, page]);
      }
    } catch (error) {
      console.error("Failed to create page:", error);
    }
  };

  const filteredBlocks = selectedPage
    ? contentBlocks.filter(b => b.page_section?.includes(selectedPage.page_path))
    : contentBlocks;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Toolbar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {view !== "list" && (
            <button
              onClick={() => {
                setView("list");
                setSelectedPage(null);
                setSelectedBlock(null);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          
          <h1 className="text-lg font-bold text-gray-900">
            {view === "list" ? "Page Builder" : selectedPage?.page_name || "Edit Content"}
          </h1>

          {view === "edit" && (
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setEditMode("visual")}
                className={`px-3 py-1.5 text-sm rounded ${
                  editMode === "visual"
                    ? "bg-gsv-green text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Layout className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditMode("code")}
                className={`px-3 py-1.5 text-sm rounded ${
                  editMode === "code"
                    ? "bg-gsv-green text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Code className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {view === "edit" && selectedBlock && (
            <>
              <button
                onClick={() => handlePublishBlock(selectedBlock.id, !selectedBlock.is_published)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedBlock.is_published
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {selectedBlock.is_published ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={() => handleSaveBlock(selectedBlock)}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save"}
              </button>
            </>
          )}
          
          {view === "edit" && (
            <button
              onClick={() => setView("preview")}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {view === "list" && (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Pages Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Pages</h2>
                  <button
                    onClick={handleCreatePage}
                    className="flex items-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90"
                  >
                    <Plus className="w-4 h-4" />
                    New Page
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className="card p-5 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedPage(page);
                        setView("edit");
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{page.page_name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{page.page_path}</p>
                          <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {page.template_type}
                          </span>
                        </div>
                        <Layers className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Blocks Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Global Content Blocks</h2>
                  <button
                    onClick={() => {
                      const key = prompt("Enter unique key for content block:");
                      if (key) {
                        const newBlock: ContentBlock = {
                          id: Date.now(),
                          key,
                          title: key,
                          content: "",
                          html_content: "",
                          page_section: "global",
                          display_order: 0,
                          is_published: false,
                          css_classes: "",
                        };
                        setSelectedBlock(newBlock);
                        setView("edit");
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-green/90"
                  >
                    <Plus className="w-4 h-4" />
                    New Block
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contentBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="card p-5 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedBlock(block);
                        setView("edit");
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <h3 className="font-semibold">{block.title || block.key}</h3>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{block.key}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              block.is_published
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {block.is_published ? "Published" : "Draft"}
                            </span>
                            {block.page_section && (
                              <span className="text-xs text-gray-500">
                                {block.page_section}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "edit" && selectedBlock && (
          <ContentBlockEditor
            block={selectedBlock}
            editMode={editMode}
            onChange={(updated) => setSelectedBlock(updated)}
            onSave={handleSaveBlock}
          />
        )}

        {view === "preview" && selectedBlock && (
          <PagePreview content={selectedBlock.html_content || selectedBlock.content || ""} />
        )}
      </div>
    </div>
  );
}

