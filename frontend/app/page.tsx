"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import BoundingBox from "@/components/homepage/LoginCard";
import Navigation from "@/components/homepage/Navigation";
import Footer from "@/components/homepage/Footer";
import Tabs, {
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/homepage/Toolbar";
import { FileText, Download, Calendar, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";

interface Document {
  id: number;
  filename: string;
  status: string;
  created_at: string;
  user_id: number;
}

export default function Home() {
  const { user, token, loading } = useAuth();
  const [tabValue, setTabValue] = useState("documents");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [fetchingDocs, setFetchingDocs] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Fetch documents if user is logged in
  const fetchDocuments = async () => {
    if (!token) return;
    setFetchingDocs(true);
    try {
      const res = await fetch(`${API_URL}/api/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setFetchingDocs(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchDocuments();
    } else {
      setDocuments([]);
    }
  }, [user, token]);

  const handleUploadSuccess = (newDoc: Document) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-950" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-white font-sans text-zinc-900">
      <main className="flex flex-1 w-full max-w-7xl border-x border-neutral-50 flex-col bg-white">
        <Navigation />

        {!user ? (
          /* GUEST VIEW / LANDING PAGE */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-fuchsia-50 border border-fuchsia-100 rounded-full text-xs text-fuchsia-700 font-semibold tracking-wide uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                Legally Binding & Secure
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                Secure digital signatures <br />
                made <span className="text-fuchsia-700">effortlessly simple.</span>
              </h1>
              <p className="text-lg text-zinc-500 font-normal leading-relaxed max-w-xl mx-auto">
                Upload PDFs, place digital signatures, track workflow status, and generate immutable signed documents with complete audit trails.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-zinc-900 text-white rounded-lg transition-opacity hover:opacity-90 no-underline shadow-sm"
              >
                Start Signing Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center px-5 py-2.5 text-sm font-semibold border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 no-underline"
              >
                Learn More
              </a>
            </div>

            {/* Premium visual mock cards */}
            <div className="relative pt-6 w-full max-w-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-indigo-500/10 blur-3xl -z-10 rounded-full" />
              <div className="border border-zinc-200 bg-white rounded-xl shadow-xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-left">
                <div className="space-y-3 max-w-sm">
                  <h3 className="text-lg font-bold text-zinc-900">Try it out in seconds</h3>
                  <p className="text-sm text-zinc-500 font-normal leading-relaxed">
                    Create an account to access your personal dashboard, securely upload PDF templates, and view signature statuses.
                  </p>
                </div>
                <div className="w-full max-w-xs flex flex-col items-center bg-zinc-50 border border-zinc-200/60 rounded-xl p-6">
                  <FileText className="w-10 h-10 text-zinc-400 mb-2" strokeWidth={1.5} />
                  <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase mb-4">No Document Uploaded</span>
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 no-underline"
                  >
                    Upload Document
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED DASHBOARD */
          <div className="flex-1 p-6 md:p-8 space-y-8">
            {/* Header Title */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
              <p className="text-sm text-zinc-500">
                Manage your uploads and sign documents.
              </p>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left columns: Upload Card */}
              <div className="lg:col-span-1 space-y-6">
                <div className="border border-zinc-200/80 bg-white rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                  <h3 className="text-sm font-bold tracking-wide uppercase text-zinc-400 mb-3 px-1">
                    Quick Upload
                  </h3>
                  <BoundingBox onUploadSuccess={handleUploadSuccess} />
                </div>
              </div>

              {/* Right column: Document List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="border border-zinc-200/80 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden">
                  <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-800">
                      My Documents ({documents.length})
                    </h3>
                    <button
                      onClick={fetchDocuments}
                      className="text-xs text-zinc-500 hover:text-zinc-900 font-semibold focus:outline-none"
                    >
                      Refresh
                    </button>
                  </div>

                  {fetchingDocs ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
                      <span className="text-xs text-zinc-400">Loading documents...</span>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <FileText className="w-12 h-12 text-zinc-300 mb-2" strokeWidth={1.5} />
                      <h4 className="text-sm font-semibold text-zinc-700">No documents yet</h4>
                      <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                        Upload your first PDF document using the upload card on the left.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50/50 text-[11px] font-bold tracking-wider text-zinc-400 uppercase border-b border-zinc-100">
                            <th className="px-6 py-3">Document Name</th>
                            <th className="px-6 py-3">Uploaded</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 bg-white">
                          {documents.map((doc) => (
                            <tr key={doc.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2.5">
                                  <FileText className="w-4 h-4 text-fuchsia-600 flex-shrink-0" />
                                  <span className="text-sm font-semibold text-zinc-900 truncate max-w-[200px]" title={doc.filename}>
                                    {doc.filename}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>
                                    {new Date(doc.created_at).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                                  doc.status === "signed"
                                    ? "bg-green-50 text-green-700 border border-green-100"
                                    : "bg-amber-50 text-amber-700 border border-amber-100"
                                }`}>
                                  {doc.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <a
                                    href={`${API_URL}/api/documents/${doc.id}/download?token=${token}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                                    title="Download PDF"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                  <Link
                                    href={`/sign/${doc.id}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-zinc-900 text-white rounded hover:bg-zinc-800 no-underline transition-colors"
                                  >
                                    Sign
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </main>
    </div>
  );
}
