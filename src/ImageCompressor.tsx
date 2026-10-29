
import { useEffect, useRef, useState } from "react";
import "./ImageCompressor.css";

type ImageCompressorProps = {
  onBack: () => void;
};

type ResultImage = {
  url: string;
  blob: Blob;
  name: string;
  originalSize: number;
  compressedSize: number;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not open this image. Please try another file."));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Image compression failed. Please try another image."));
        }
      },
      type,
      quality
    );
  });
}

function ImageCompressor({ onBack }: ImageCompressorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [quality, setQuality] = useState(75);
  const [result, setResult] = useState<ResultImage | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function clearResult() {
    setResult((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }

  function handleFile(selectedFile?: File) {
    if (!selectedFile) return;

    setError("");
    clearResult();

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(selectedFile.type)) {
      setError("Please use a JPG, PNG, or WebP image.");
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const newPreview = URL.createObjectURL(selectedFile);
    previewUrlRef.current = newPreview;

    setFile(selectedFile);
    setPreviewUrl(newPreview);
    setResult(null);
  }

  async function compressImage() {
    if (!file) {
      setError("First, choose an image to compress.");
      return;
    }

    setIsCompressing(true);
    setError("");
    clearResult();

    try {
      const image = await loadImage(file);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Your browser could not process this image.");
      }

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      // Fill white behind transparent images when exporting as JPEG.
      if (file.type === "image/jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      context.drawImage(image, 0, 0);

      const outputType =
        file.type === "image/png" ? "image/png" : file.type;

      const outputBlob = await canvasToBlob(
        canvas,
        outputType,
        quality / 100
      );

      const outputUrl = URL.createObjectURL(outputBlob);

      setResult({
        url: outputUrl,
        blob: outputBlob,
        name: file.name.replace(/\.[^/.]+$/, ""),
        originalSize: file.size,
        compressedSize: outputBlob.size,
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsCompressing(false);
    }
  }

  function resetTool() {
    setFile(null);
    setPreviewUrl("");
    setError("");
    clearResult();

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setQuality(75);
  }

  const savedBytes =
    result && result.originalSize > 0
      ? result.originalSize - result.compressedSize
      : 0;

  const savedPercentage =
    result && result.originalSize > 0
      ? Math.max(
          0,
          Math.round(
            ((result.originalSize - result.compressedSize) /
              result.originalSize) *
              100
          )
        )
      : 0;

  return (
    <div className="compressor-page">
      <header className="compressor-topbar">
        <button className="compressor-brand" onClick={onBack} type="button">
          <span className="compressor-brand-mark">Z</span>
          <span>zenvora<span className="compressor-brand-dot">.</span></span>
        </button>

        <button className="back-button" onClick={onBack} type="button">
          <span aria-hidden="true">←</span> Back to tools
        </button>
      </header>

      <main className="compressor-main">
        <div className="compressor-heading">
          <div className="compressor-eyebrow">
            <span>✳</span> IMAGE TOOLS
          </div>

          <h1>Image <span>Compressor.</span></h1>

          <p>
            Make your images smaller without complicated software.
            Choose an image, adjust quality, and download your result.
          </p>
        </div>

        <section className="compressor-workspace">
          <div className="compressor-panel">
            <div className="panel-title">
              <div>
                <span className="panel-step">01</span>
                <h2>Choose your image</h2>
              </div>
              {file && (
                <button className="text-button" onClick={resetTool} type="button">
                  Remove image
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              className="hidden-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />

            {!file ? (
              <button
                className="upload-zone"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  handleFile(event.dataTransfer.files?.[0]);
                }}
              >
                <span className="upload-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 16V4m0 0L7 9m5-5 5 5" />
                    <path d="M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4" />
                  </svg>
                </span>
                <strong>Click to upload your image</strong>
                <span>or drag and drop it here</span>
                <small>JPG, PNG, or WebP</small>
              </button>
            ) : (
              <div className="selected-image">
                <div className="selected-image-preview">
                  <img src={previewUrl} alt="Original image preview" />
                </div>
                <div className="selected-image-info">
                  <strong title={file.name}>{file.name}</strong>
                  <span>{formatBytes(file.size)}</span>
                  <span>
                    {file.type.split("/")[1]?.toUpperCase()} ·{" "}
                    {file.type.startsWith("image/") ? "Image" : "File"}
                  </span>
                  <button
                    className="text-button"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    Choose another image
                  </button>
                </div>
              </div>
            )}

            <div className="supported-note">
              <span>🔒</span>
              Your image stays in your browser. No upload to a server.
            </div>
          </div>

          <div className="compressor-panel settings-panel">
            <div className="panel-title">
              <div>
                <span className="panel-step">02</span>
                <h2>Compression settings</h2>
              </div>
            </div>

            <div className="quality-heading">
              <label htmlFor="quality-slider">Image quality</label>
              <strong>{quality}%</strong>
            </div>

            <input
              id="quality-slider"
              className="quality-slider"
              type="range"
              min="10"
              max="100"
              step="5"
              value={quality}
              onChange={(event) => setQuality(Number(event.target.value))}
            />

            <div className="slider-labels">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>

            <div className="quality-options">
              <button
                type="button"
                className={quality === 40 ? "quality-option active" : "quality-option"}
                onClick={() => setQuality(40)}
              >
                <span>⚡</span>
                <strong>Small</strong>
                <small>40% quality</small>
              </button>
              <button
                type="button"
                className={quality === 75 ? "quality-option active" : "quality-option"}
                onClick={() => setQuality(75)}
              >
                <span>◈</span>
                <strong>Balanced</strong>
                <small>75% quality</small>
              </button>
              <button
                type="button"
                className={quality === 95 ? "quality-option active" : "quality-option"}
                onClick={() => setQuality(95)}
              >
                <span>✧</span>
                <strong>High</strong>
                <small>95% quality</small>
              </button>
            </div>

            <p className="settings-tip">
              Lower quality usually creates a smaller file. Results vary by
              image format and content.
            </p>

            <button
              className="compress-button"
              type="button"
              onClick={compressImage}
              disabled={!file || isCompressing}
            >
              {isCompressing ? "Compressing image..." : "Compress image"}
              {!isCompressing && <span aria-hidden="true">↗</span>}
            </button>

            {error && (
              <p className="compressor-error" role="alert">
                {error}
              </p>
            )}
          </div>
        </section>

        {result && (
          <section className="result-panel">
            <div className="result-heading">
              <div>
                <span className="panel-step">03</span>
                <h2>Your compressed image</h2>
              </div>
              <span className="result-success">✓ Complete</span>
            </div>

            <div className="result-content">
              <div className="result-preview">
                <img src={result.url} alt="Compressed image preview" />
              </div>

              <div className="result-details">
                <div className="result-saved">
                  <span className="saved-check">✓</span>
                  <div>
                    <strong>
                      {savedBytes > 0
                        ? `${savedPercentage}% smaller`
                        : "Compression complete"}
                    </strong>
                    <span>
                      {savedBytes > 0
                        ? `You saved ${formatBytes(savedBytes)}`
                        : "This version is not smaller than the original."}
                    </span>
                  </div>
                </div>

                <div className="size-comparison">
                  <div>
                    <span>Original size</span>
                    <strong>{formatBytes(result.originalSize)}</strong>
                  </div>
                  <div>
                    <span>Compressed size</span>
                    <strong>{formatBytes(result.compressedSize)}</strong>
                  </div>
                </div>

                <a
                  className="download-button"
                  href={result.url}
                  download={`${result.name}-compressed.${result.blob.type === "image/png" ? "png" : result.blob.type === "image/webp" ? "webp" : "jpg"}`}
                >
                  <span aria-hidden="true">↓</span> Download compressed image
                </a>
              </div>
            </div>
          </section>
        )}

        <div className="compressor-footer-note">
          <span>✳</span>
          <p>
            <strong>Good to know</strong>
            PNG images may not get smaller with quality adjustment. If the
            compressed file is larger, try a JPG or WebP image.
          </p>
        </div>
      </main>
    </div>
  );
}

export default ImageCompressor;
