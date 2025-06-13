import { useState } from "react";

const imagesAIClub = [
  "/ai/الدوار_page-0001.jpg",
  "/ai/النافورة_page-0001.jpg",
  "/ai/البلد_page-0001.jpg",
  "/ai/البلد-مع-اضحيات_page-0001.jpg",
  "/ai/ميدان-الفوانيس_page-0001.jpg",
  "/ai/دوار-الكره-الارضية-مع-اضحيات_page-0001.jpg",
];

const imagesOthers = [
  "/others/الدوار-٢_page-0001.jpg",
  "/others/النافورة_page-0001 (1).jpg",
  "/others/البلد_page-0001 (1).jpg",
  "/others/البلد-٢_page-0001.jpg",
  "/others/الفوانيس_pages-to-jpg-0001.jpg",
  "/others/d32b0cdd-309c-4faa-a99d-29886ca425a6.png",
];

export default function Home() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const handleDownload = (src) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      ctx.font = "50pt TheYearofTheCamel-Bold";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(name, canvas.width / 2, canvas.height - 100);
      const link = document.createElement("a");
      link.download = "eid-card.png";
      link.href = canvas.toDataURL();
      link.click();
    };
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center text-white"
      style={{ backgroundImage: `url('/bg/bg.png')` }}
    >
      <img src="/bg/logo.png" className="w-24 mb-8" alt="Logo" />

      {step === 1 && (
        <div className="flex flex-col items-center gap-4">
          <input
            type="text"
            placeholder="ادخل اسمك الكامل بالعربية"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-4 rounded-lg text-black"
          />
          <button
            onClick={() => setStep(2)}
            className="bg-white text-black px-4 py-2 rounded"
          >
            التالي
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => {
              setCategory("ai");
              setStep(3);
            }}
            className="bg-white text-black px-4 py-2 rounded"
          >
            مستفيد من نادي الذكاء الاصطناعي
          </button>
          <button
            onClick={() => {
              setCategory("others");
              setStep(3);
            }}
            className="bg-white text-black px-4 py-2 rounded"
          >
            غير ذلك
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(category === "ai" ? imagesAIClub : imagesOthers).map((src, idx) => (
            <div
              key={idx}
              className="cursor-pointer border rounded-lg overflow-hidden"
              onClick={() => handleDownload(src)}
            >
              <img src={src} alt={`img-${idx}`} className="rounded-lg" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
