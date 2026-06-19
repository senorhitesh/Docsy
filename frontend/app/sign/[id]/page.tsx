"use client";

import React, { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Navigation from "@/components/homepage/Navigation";
import Footer from "@/components/homepage/Footer";
import {
  FileText,
  Edit3,
  Check,
  Trash2,
  ArrowLeft,
  Info,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/app/component/ProtectedRoute";

interface DocumentMeta {
  id: number;
  filename: string;
  status: string;
  created_at: string;
}

interface PlacedSignature {
  id: number;
  pageNum: number;
  x: number;
  y: number;
  width: number;
  height: number;
  image: string;
  clientWidth: number;
  clientHeight: number;
}

interface PageRendererProps {
  pageNum: number;
  pdfDoc: any;
  onPageClick: (pageNum: number, e: React.MouseEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}

const PageRenderer: React.FC<PageRendererProps> = ({
  pageNum,
  pdfDoc,
  onPageClick,
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let active = true;
    const renderPage = async () => {
      if (!pdfDoc) return;
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.2 });
        if (!active) return;
        setSize({ width: viewport.width, height: viewport.height });

        // Small timeout to allow state to update width/height before rendering
        setTimeout(async () => {
          if (!active) return;
          const canvas = canvasRef.current;
          if (!canvas) return;
          const context = canvas.getContext("2d");
          if (!context) return;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          await page.render(renderContext).promise;
          if (active) setRendered(true);
        }, 50);
      } catch (err) {
        console.error("Error rendering page:", err);
      }
    };

    renderPage();
    return () => {
      active = false;
    };
  }, [pdfDoc, pageNum]);

  return (
    <div
      onClick={(e) => onPageClick(pageNum, e)}
      className="relative shadow-md border border-zinc-200 bg-white mb-6 cursor-crosshair select-none"
      style={{ width: size.width, height: size.height }}
    >
      <canvas ref={canvasRef} width={size.width} height={size.height} />
      {rendered && children}
    </div>
  );
};

export default function SignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { token } = useAuth();
  const router = useRouter();

  const [documentMeta, setDocumentMeta] = useState<DocumentMeta | null>(null);
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Signature state
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [placedSignatures, setPlacedSignatures] = useState<PlacedSignature[]>(
    [],
  );
  const [isFinalized, setIsFinalized] = useState(false);

  // Drawing state
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Cursive typing state
  const [modalTab, setModalTab] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("");
  const [selectedFont, setSelectedFont] = useState("Dancing Script");

  // Drag and drop state
  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Load PDF.js from CDN
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    script.async = true;
    script.onload = () => {
      if ((window as any).pdfjsLib) {
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
        setPdfjsLoaded(true);
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch Metadata and Load PDF
  useEffect(() => {
    const fetchDocAndLoad = async () => {
      if (!token || !pdfjsLoaded) return;
      try {
        setLoading(true);
        // Fetch metadata
        const metaRes = await fetch(`${API_URL}/api/documents/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!metaRes.ok) {
          throw new Error("Document metadata could not be fetched.");
        }
        const metaData = await metaRes.json();
        setDocumentMeta(metaData);

        // Fetch PDF arrayBuffer
        const pdfRes = await fetch(`${API_URL}/api/documents/${id}/download`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!pdfRes.ok) {
          throw new Error("Failed to download PDF file.");
        }
        const arrayBuffer = await pdfRes.arrayBuffer();

        // Parse PDF using loaded pdfjsLib
        const loadingTask = (window as any).pdfjsLib.getDocument({
          data: arrayBuffer,
        });
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
      } catch (err: any) {
        console.error("Error loading document:", err);
        setError(err.message || "Failed to load document.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocAndLoad();
  }, [id, token, pdfjsLoaded]);

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Touch Support for Drawing
  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    setIsDrawing(true);
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    if (modalTab === "draw") {
      const canvas = signatureCanvasRef.current;
      if (!canvas) return;

      const dataUrl = canvas.toDataURL("image/png");
      setSignatureImage(dataUrl);
    } else {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 400;
      tempCanvas.height = 150;
      const ctx = tempCanvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.font = `italic 36px "${selectedFont}", cursive`;
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(typedName || "Signature", 200, 75);

        const dataUrl = tempCanvas.toDataURL("image/png");
        setSignatureImage(dataUrl);
      }
    }
    setIsModalOpen(false);
    setError(null);
  };

  // Placing Signature on Click
  const handlePageClick = (
    pageNum: number,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    // If active drag is happening, don't place another
    if (activeDragId !== null) return;

    if (!signatureImage) {
      setError(
        "Please draw and save a signature first, then click on the page to place it.",
      );
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSig: PlacedSignature = {
      id: Date.now(),
      pageNum,
      x: x - 75, // Center overlay (assuming 150px width)
      y: y - 25, // Center overlay (assuming 50px height)
      width: 150,
      height: 50,
      image: signatureImage,
      clientWidth: rect.width,
      clientHeight: rect.height,
    };

    setPlacedSignatures((prev) => [...prev, newSig]);
    setError(null);
  };

  // Drag Handlers
  const handleSignatureMouseDown = (sigId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveDragId(sigId);

    const sig = placedSignatures.find((s) => s.id === sigId);
    if (sig) {
      setDragOffset({
        x: e.clientX - sig.x,
        y: e.clientY - sig.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeDragId === null) return;
    e.preventDefault();

    setPlacedSignatures((prev) =>
      prev.map((sig) => {
        if (sig.id === activeDragId) {
          return {
            ...sig,
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y,
          };
        }
        return sig;
      }),
    );
  };

  const handleMouseUp = () => {
    setActiveDragId(null);
  };

  const [saving, setSaving] = useState(false);

  const handleFinalize = async () => {
    if (placedSignatures.length === 0) {
      setError("Please place at least one signature on the document.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        signatures: placedSignatures.map((sig) => ({
          pageNum: sig.pageNum,
          x: sig.x,
          y: sig.y,
          width: sig.width,
          height: sig.height,
          clientWidth: sig.clientWidth,
          clientHeight: sig.clientHeight,
          image: sig.image,
        })),
      };

      const res = await fetch(`${API_URL}/api/documents/${id}/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to save signed document.");
      }

      setIsFinalized(true);
    } catch (err: any) {
      console.error("Error signing document:", err);
      setError(
        err.message ||
          "Failed to save signed document. Is the backend running?",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen bg-zinc-50 flex flex-col font-sans select-none text-zinc-900"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Navigation />

        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto border-x border-zinc-100 bg-white">
          {/* Side Toolbar / Control Panel */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-zinc-100 p-6 flex flex-col justify-between shrink-0 bg-zinc-50/50">
            <div className="space-y-6">
              {/* Back Link */}
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-950 no-underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Dashboard
              </Link>

              {/* Doc Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-fuchsia-700" />
                  <h2
                    className="text-base font-bold text-zinc-900 truncate"
                    title={documentMeta?.filename}
                  >
                    {documentMeta?.filename || "Loading..."}
                  </h2>
                </div>
                {documentMeta && (
                  <p className="text-xs text-zinc-500 font-medium">
                    Pages: {numPages} | Status:{" "}
                    <span className="uppercase text-[10px] font-bold bg-zinc-200/60 px-1.5 py-0.5 rounded">
                      {documentMeta.status}
                    </span>
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-2.5">
                <h4 className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Info className="w-3.5 h-3.5 text-zinc-500" />
                  Instructions
                </h4>
                <ol className="text-xs text-zinc-600 space-y-1.5 pl-4 list-decimal leading-relaxed">
                  <li>
                    Click <b>Draw Signature</b> to sign.
                  </li>
                  <li>
                    Click anywhere on the document page wrappers to place your
                    signature.
                  </li>
                  <li>
                    Click and drag placed signatures to position them perfectly.
                  </li>
                  <li>
                    Click <b>Finalize Document</b> when done.
                  </li>
                </ol>
              </div>

              {/* Signature Preview / Add Button */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                  Your Signature
                </h3>
                {signatureImage ? (
                  <div className="relative group border border-dashed border-zinc-300 rounded-lg p-4 bg-white flex flex-col items-center justify-center">
                    <img
                      src={signatureImage}
                      alt="Current Signature"
                      className="h-12 object-contain"
                    />
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="absolute inset-0 bg-zinc-950/40 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer"
                    >
                      Redraw
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 shadow-sm transition-all cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-zinc-500" />
                    Draw Signature
                  </button>
                )}
              </div>
            </div>

            {/* Finalize Button */}
            <div className="pt-6 border-t border-zinc-200/80 mt-6 space-y-3">
              {error && (
                <div className="text-xs text-red-600 font-semibold leading-normal">
                  {error}
                </div>
              )}
              <button
                onClick={handleFinalize}
                disabled={loading || saving || placedSignatures.length === 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-900 text-white hover:opacity-90 disabled:opacity-40 text-sm font-semibold transition-all cursor-pointer"
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {saving ? "Saving Document..." : "Finalize Document"}
              </button>
            </div>
          </div>

          {/* Central PDF Display viewport */}
          <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-start overflow-y-auto max-h-[calc(100vh-3.5rem)] bg-zinc-100/50">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
                <span className="text-xs text-zinc-500 font-sans tracking-wide uppercase">
                  Loading PDF Document...
                </span>
              </div>
            ) : error && !pdfDoc ? (
              <div className="flex flex-col items-center justify-center py-32 text-center space-y-2 max-w-sm">
                <FileText className="w-12 h-12 text-red-300" />
                <h3 className="text-sm font-bold text-zinc-800">
                  Failed to render
                </h3>
                <p className="text-xs text-zinc-500 leading-normal">{error}</p>
                <Link
                  href="/"
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 text-white text-xs font-semibold no-underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
                </Link>
              </div>
            ) : (
              /* PDF Pages Container */
              <div className="flex flex-col items-center w-full max-w-4xl">
                {Array.from({ length: numPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <PageRenderer
                      key={pageNum}
                      pageNum={pageNum}
                      pdfDoc={pdfDoc}
                      onPageClick={handlePageClick}
                    >
                      {/* Render placed signatures overlay on this page */}
                      {placedSignatures
                        .filter((sig) => sig.pageNum === pageNum)
                        .map((sig) => (
                          <div
                            key={sig.id}
                            onMouseDown={(e) =>
                              handleSignatureMouseDown(sig.id, e)
                            }
                            style={{
                              position: "absolute",
                              left: sig.x,
                              top: sig.y,
                              width: sig.width,
                              height: sig.height,
                            }}
                            className={`group border border-dashed border-fuchsia-500 bg-fuchsia-50/15 cursor-move ${
                              activeDragId === sig.id
                                ? "scale-102 border-fuchsia-600 shadow-sm"
                                : ""
                            }`}
                          >
                            <img
                              src={sig.image}
                              alt="Placed Signature"
                              className="w-full h-full object-contain pointer-events-none"
                            />
                            {/* Remove signature action */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setPlacedSignatures((prev) =>
                                  prev.filter((s) => s.id !== sig.id),
                                );
                              }}
                              className="absolute -top-2.5 -right-2.5 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none border border-white cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                    </PageRenderer>
                  ),
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal: Canvas Drawing / Cursive Typing Pad */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-xs p-6">
            <div className="bg-white border border-zinc-200 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-bold text-zinc-900">
                  Create Your Signature
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-900 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex px-6 pt-3 shrink-0">
                <div className="flex border-b border-zinc-200 w-full">
                  <button
                    onClick={() => setModalTab("draw")}
                    className={`pb-2 text-xs font-bold border-b-2 px-4 transition-all cursor-pointer ${
                      modalTab === "draw"
                        ? "border-zinc-900 text-zinc-900"
                        : "border-transparent text-zinc-400 hover:text-zinc-700"
                    }`}
                  >
                    Draw Signature
                  </button>
                  <button
                    onClick={() => setModalTab("type")}
                    className={`pb-2 text-xs font-bold border-b-2 px-4 transition-all cursor-pointer ${
                      modalTab === "type"
                        ? "border-zinc-900 text-zinc-900"
                        : "border-transparent text-zinc-400 hover:text-zinc-700"
                    }`}
                  >
                    Type Signature
                  </button>
                </div>
              </div>

              {/* Modal Content Scroll Area */}
              <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center">
                {modalTab === "draw" ? (
                  /* DRAW SIGNATURE */
                  <div className="flex flex-col items-center w-full">
                    <canvas
                      ref={signatureCanvasRef}
                      width={400}
                      height={200}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawingTouch}
                      onTouchMove={drawTouch}
                      onTouchEnd={stopDrawing}
                      className="border border-zinc-200 bg-zinc-50 rounded-lg cursor-crosshair shadow-inner w-full max-w-[400px]"
                    />
                    <p className="text-[11px] text-zinc-400 font-medium mt-3 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> Use your mouse or
                      touchscreen to draw inside the box.
                    </p>
                  </div>
                ) : (
                  /* TYPE SIGNATURE */
                  <div className="w-full space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label
                        className="text-xs font-semibold text-zinc-700"
                        htmlFor="modalTypedName"
                      >
                        Full Name:
                      </label>
                      <input
                        id="modalTypedName"
                        type="text"
                        placeholder="Your name"
                        value={typedName}
                        onChange={(e) => setTypedName(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white py-2 px-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                    </div>

                    {/* Pre-styled Font Previews */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-700 block text-left">
                        Select Cursive Style:
                      </label>
                      <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-200 max-h-[160px] overflow-y-auto bg-zinc-50/50">
                        {[
                          { name: "Dancing Script", family: "Dancing Script" },
                          { name: "Alex Brush", family: "Alex Brush" },
                          { name: "Great Vibes", family: "Great Vibes" },
                          { name: "Pacifico", family: "Pacifico" },
                          { name: "Satisfy", family: "Satisfy" },
                        ].map((font) => (
                          <div
                            key={font.name}
                            onClick={() => setSelectedFont(font.family)}
                            className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                              selectedFont === font.family
                                ? "bg-zinc-100 text-zinc-900 font-bold"
                                : "hover:bg-zinc-50 text-zinc-600"
                            }`}
                          >
                            <span
                              style={{ fontFamily: font.family }}
                              className="text-2xl tracking-wide select-none"
                            >
                              {typedName || "Signature"}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                              {font.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/80 flex justify-between items-center shrink-0">
                {modalTab === "draw" ? (
                  <button
                    onClick={clearCanvas}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50 text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-zinc-500" />
                    Clear Drawing
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSignature}
                    disabled={modalTab === "type" && !typedName}
                    className="px-3.5 py-2 text-xs font-semibold bg-zinc-900 text-white hover:opacity-90 rounded-lg shadow-sm cursor-pointer disabled:opacity-40"
                  >
                    Save Signature
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Document Signed Success Dialog */}
        {isFinalized && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-6 animate-fade-in">
            <div className="bg-white border border-zinc-200 rounded-xl shadow-2xl w-full max-w-md p-6 text-center space-y-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 border border-green-200 text-green-600">
                <Check className="h-6 w-6 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-zinc-900 font-sans">
                  Document Signed Successfully!
                </h2>
                <p className="text-xs leading-relaxed text-zinc-500 font-medium">
                  Your signatures have been embedded at the specified
                  coordinates. An immutable copy is generated and logged in your
                  audit log history.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsFinalized(false);
                  router.push("/");
                }}
                className="w-full py-2.5 px-4 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                Go Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
