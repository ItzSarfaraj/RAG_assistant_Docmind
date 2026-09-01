function PdfPreview({ document }) {
  if (!document?.url) {
    return (
      <div className="flex h-full items-center justify-center px-8 text-center">
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
            📄
          </div>

          <h3 className="mt-4 text-sm font-semibold text-[#22201A]">
            PDF unavailable
          </h3>

          <p className="mt-2 text-xs leading-5 text-[#8A8473]">
            The PDF file could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  const fileUrl = `http://localhost:5000${document.url}`;

  return (
    <iframe
      src={fileUrl}
      title={document.name || "PDF document"}
      className="h-full w-full border-0"
    />
  );
}

export default PdfPreview;