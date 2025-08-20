"use client";

import { useRef } from "react";

export default function ExportImport() {
  const exportRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  function handleExportClick() {
    if (!exportRef.current) return;
  }

  function handleImportClick() {
    if (!importRef.current) return;
  }

  return (
    <div>
      <div>
        <button>Export</button>
        <input ref={exportRef} type="file" hidden />
      </div>
      <div>
        <button>Import</button>
        <input ref={importRef} type="file" hidden />
      </div>
    </div>
  );
}
