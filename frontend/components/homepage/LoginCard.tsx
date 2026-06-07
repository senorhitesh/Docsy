import React from "react";
import { Upload } from "lucide-react";
import DOCUMENT_SVG from "./DOCUMENT_SVG";

interface BoundingBoxProps {
  title?: string;
  description?: string;
  showIcon?: boolean;
}

export const BoundingBox: React.FC<BoundingBoxProps> = ({}) => {
  return (
    <div className="relative group   p-2 inline-block w-full max-w-xl">
      {/* Top-Left Crosshair */}
      <div className="transition duration-200 absolute -top-1.5 group-hover:-translate-2 left-1 text-zinc-400 pointer-events-none select-none font-light text-xl">
        +
      </div>

      {/* Top-Right Crosshair */}
      <div className="transition duration-200 absolute -top-1.5 right-1 group-hover:-translate-y-2 group-hover:translate-x-2 text-zinc-400 pointer-events-none select-none font-light text-xl">
        +
      </div>

      {/* Bottom-Left Crosshair */}
      <div className="transition duration-200 group-hover:translate-y-2 group-hover:-translate-x-2  absolute -bottom-1.5 left-1 text-zinc-400 pointer-events-none select-none font-light text-xl">
        +
      </div>

      {/* Bottom-Right Crosshair */}
      <div className="transition duration-200 group-hover:translate-y-2 group-hover:translate-x-2 absolute -bottom-1.5 right-1 text-zinc-400 pointer-events-none select-none font-light text-xl">
        +
      </div>
      <div className="relative overflow-hidden px-8 pt-8 pb-4 border-dashed  border  border-zinc-300 group  bg-white text-zinc-900 font-sans">
        <div className="absolute scale-60 -right-8 group-hover:-translate-x-1  transition duration-150">
          <DOCUMENT_SVG classname="group-hover:skew-y-0 " />
        </div>
        <div className="absolute scale-60 top-13 -right-1 group-hover:-translate-x-4 transition duration-150">
          <DOCUMENT_SVG classname="group-hover:skew-y-0 " />
        </div>
        {/* Content Area */}
        <div className="space-y-1">
          <div className="flex items-center ">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
              Start Signing with{" "}
              <span className="text-fuchsia-700">Docsy.</span>
            </h2>
          </div>
          <p className="text-[15px] leading-relaxed text-zinc-600 font-normal">
            Experience the future of document signing with Docsy.
          </p>
        </div>
        <div className="mt-4">
          <button className="group cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs  tracking-wider uppercase border border-zinc-200 font-semibold rounded bg-zinc-50 text-zinc-700 transition-all duration-200  hover:text-neutral-900  focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2">
            Upload
            <Upload className="w-3.5 h-3.5 font-semibold" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoundingBox;
