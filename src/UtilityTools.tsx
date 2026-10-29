
import { useState } from "react";
import { jsPDF } from "jspdf";
import { PDFDocument } from "pdf-lib";
import "./UtilityTools.css";

type Props = {
  tool: string;
  onBack: () => void;
};

export default function UtilityTools({ tool, onBack }: Props) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [keepRatio, setKeepRatio] = useState(true);
  const [ratio, setRatio] = useState(4 / 3);
  const [percent, setPercent] = useState(10);
  const [amount, setAmount] = useState(100);
  const [value, setValue] = useState(1);
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("km");
  const [caseType, setCaseType] = useState("upper");

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function chooseImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    setImage(file);
    setMessage("");
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      setRatio(img.naturalWidth / img.naturalHeight);
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      setMessage("Could not open this image.");
    };

    img.src = url;
  }

  async function resizeImage() {
    if (!image) {
      setMessage("First select an image.");
      return;
    }

    if (width < 1 || height < 1 || width > 10000 || height > 10000) {
      setMessage("Width and height must be between 1 and 10000 pixels.");
      return;
    }

    const url = URL.createObjectURL(image);

    try {
      const img = new Image();
      img.src = url;
      await img.decode();

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => result ? resolve(result) : reject(new Error("Resize failed")),
          "image/png"
        );
      });

      downloadBlob(blob, "zenvora-resized.png");
      setMessage("Image resized and downloaded!");
    } catch {
      setMessage("Could not resize the image. Please try another file.");
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function imagesToPdf() {
    if (!files.length) {
      setMessage("Please select one or more images.");
      return;
    }

    try {
      const pdf = new jsPDF();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          throw new Error("Select image files only.");
        }

        const url = URL.createObjectURL(file);
        try {
          const img = new Image();
          img.src = url;
          await img.decode();

          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas unavailable");

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          const data = canvas.toDataURL("image/jpeg", 0.92);
          const orientation = img.naturalWidth > img.naturalHeight
            ? "landscape"
            : "portrait";

          if (i > 0) pdf.addPage("a4", orientation);
          else if (orientation === "landscape") {
            pdf.deletePage(1);
            pdf.addPage("a4", "landscape");
          }

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const scale = Math.min(
            pageWidth / img.naturalWidth,
            pageHeight / img.naturalHeight
          );
          const w = img.naturalWidth * scale;
          const h = img.naturalHeight * scale;

          pdf.addImage(
            data,
            "JPEG",
            (pageWidth - w) / 2,
            (pageHeight - h) / 2,
            w,
            h
          );
        } finally {
          URL.revokeObjectURL(url);
        }
      }

      pdf.save("zenvora-images.pdf");
      setMessage("PDF created and downloaded!");
    } catch {
      setMessage("Could not create PDF. Please try valid JPG or PNG images.");
    }
  }

  async function mergePdfs() {
    if (files.length < 2) {
      setMessage("Select at least two PDF files.");
      return;
    }

    try {
      const merged = await PDFDocument.create();

      for (const file of files) {
        if (!file.name.toLowerCase().endsWith(".pdf")) {
          throw new Error("PDF files only");
        }

        const source = await PDFDocument.load(await file.arrayBuffer());
        const pages = await merged.copyPages(source, source.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
      }

      const bytes = await merged.save();
      downloadBlob(
        new Blob([bytes as BlobPart], { type: "application/pdf" }),
        "zenvora-merged.pdf"
      );
      setMessage("PDF files merged and downloaded!");
    } catch {
      setMessage("Could not merge PDFs. Check the files are valid and not password-protected.");
    }
  }

  function formatText() {
    let result = text;

    if (caseType === "upper") result = result.toUpperCase();
    if (caseType === "lower") result = result.toLowerCase();
    if (caseType === "title") {
      result = result.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    }
    if (caseType === "trim") {
      result = result
        .split("\n")
        .map((line) => line.trim().replace(/[ \t]+/g, " "))
        .join("\n")
        .trim();
    }

    setText(result);
    setMessage("Text formatted!");
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const noSpaces = text.replace(/\s/g, "").length;
  const sentences = text.trim()
    ? text.split(/[.!?]+/).filter((sentence) => sentence.trim()).length
    : 0;

  const unitGroups: Record<string, string> = {
    m: "length", km: "length", cm: "length", mm: "length",
    ft: "length", mi: "length",
    kg: "weight", g: "weight", lb: "weight", oz: "weight",
    C: "temperature", F: "temperature",
  };

  const unitFactors: Record<string, number> = {
    m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, mi: 1609.344,
    kg: 1, g: 0.001, lb: 0.45359237, oz: 0.028349523125,
  };

  function convertUnits(): number {
    if (unitGroups[fromUnit] !== unitGroups[toUnit]) return NaN;

    if (fromUnit === "C" || fromUnit === "F") {
      const celsius = fromUnit === "C" ? value : (value - 32) * 5 / 9;
      return toUnit === "C" ? celsius : celsius * 9 / 5 + 32;
    }

    return value * unitFactors[fromUnit] / unitFactors[toUnit];
  }

  const unitOptions = ["m", "km", "cm", "mm", "ft", "mi", "kg", "g", "lb", "oz", "C", "F"];

  return (
    <main className="utility-page">
      <header className="utility-header">
        <button className="utility-back" onClick={onBack}>← Back to Zenvora</button>
        <span className="utility-brand">zenvora<span>.</span></span>
      </header>

      <section className="utility-panel">
        <p className="utility-kicker">ZEN VORA TOOLBOX</p>
        <h1>{tool}</h1>
        <p className="utility-subtitle">A simple tool for your everyday tasks.</p>

        {tool === "Image Resizer" && (
          <>
            <label className="utility-upload">
              Select image
              <input type="file" accept="image/*"
                onChange={(e) => chooseImage(e.target.files?.[0])} />
            </label>
            {image && <p>Selected: {image.name}</p>}

            <div className="utility-fields">
              <label>Width (px)
                <input type="number" min="1" max="10000" value={width}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setWidth(next);
                    if (keepRatio && ratio > 0) setHeight(Math.max(1, Math.round(next / ratio)));
                  }} />
              </label>
              <label>Height (px)
                <input type="number" min="1" max="10000" value={height}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setHeight(next);
                    if (keepRatio && ratio > 0) setWidth(Math.max(1, Math.round(next * ratio)));
                  }} />
              </label>
            </div>

            <label className="utility-check">
              <input type="checkbox" checked={keepRatio}
                onChange={(e) => setKeepRatio(e.target.checked)} />
              Keep aspect ratio
            </label>
            <button className="utility-primary" onClick={resizeImage}>Resize & Download</button>
          </>
        )}

        {tool === "Image to PDF" && (
          <>
            <label className="utility-upload">
              Select images
              <input type="file" accept="image/*" multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            </label>
            <p>{files.length} image(s) selected</p>
            <button className="utility-primary" onClick={imagesToPdf}>Create PDF</button>
          </>
        )}

        {tool === "PDF Merger" && (
          <>
            <label className="utility-upload">
              Select PDF files
              <input type="file" accept="application/pdf,.pdf" multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            </label>
            <p>{files.length} file(s) selected. Choose at least two PDFs.</p>
            <button className="utility-primary" onClick={mergePdfs}>Merge & Download</button>
          </>
        )}

        {tool === "Text Formatter" && (
          <>
            <textarea className="utility-textarea" value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..." />
            <label>Format
              <select value={caseType} onChange={(e) => setCaseType(e.target.value)}>
                <option value="upper">UPPERCASE</option>
                <option value="lower">lowercase</option>
                <option value="title">Title Case</option>
                <option value="trim">Remove extra spaces</option>
              </select>
            </label>
            <button className="utility-primary" onClick={formatText}>Format text</button>
            <button className="utility-secondary" onClick={() => {
              void navigator.clipboard.writeText(text)
                .then(() => setMessage("Text copied!"))
                .catch(() => setMessage("Copy failed. Please copy the text manually."));
            }}>Copy text</button>
          </>
        )}

        {tool === "Word Counter" && (
          <>
            <textarea className="utility-textarea" value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste text to count..." />
            <div className="utility-stats">
              <div><strong>{words}</strong><span>Words</span></div>
              <div><strong>{characters}</strong><span>Characters</span></div>
              <div><strong>{noSpaces}</strong><span>Characters without spaces</span></div>
              <div><strong>{sentences}</strong><span>Sentences</span></div>
            </div>
          </>
        )}

        {tool === "Percentage Calculator" && (
          <>
            <label>Percentage (%)
              <input type="number" value={percent}
                onChange={(e) => setPercent(Number(e.target.value))} />
            </label>
            <label>Number
              <input type="number" value={amount}
                onChange={(e) => setAmount(Number(e.target.value))} />
            </label>
            <div className="utility-result">
              {percent}% of {amount} = <strong>
                {(percent * amount / 100).toLocaleString(undefined, { maximumFractionDigits: 6 })}
              </strong>
            </div>
          </>
        )}

        {tool === "Unit Converter" && (
          <>
            <label>Value
              <input type="number" value={value}
                onChange={(e) => setValue(Number(e.target.value))} />
            </label>
            <div className="utility-fields">
              <label>From
                <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
                  {unitOptions.map((unit) => <option key={unit}>{unit}</option>)}
                </select>
              </label>
              <label>To
                <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
                  {unitOptions.map((unit) => <option key={unit}>{unit}</option>)}
                </select>
              </label>
            </div>
            <div className="utility-result">
              Result: <strong>
                {Number.isFinite(convertUnits())
                  ? convertUnits().toLocaleString(undefined, { maximumFractionDigits: 8 })
                  : "Choose compatible units"}
              </strong>
            </div>
            <p className="utility-hint">Choose units from the same group: length, weight, or temperature.</p>
          </>
        )}

        {message && <p className="utility-message" role="status">{message}</p>}
      </section>
    </main>
  );
}
