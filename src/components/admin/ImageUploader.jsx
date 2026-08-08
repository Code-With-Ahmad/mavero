import { useRef, useState } from "react";
import { FaUpload, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import toast from "react-hot-toast";
import { uploadImageToCloudinary } from "../../lib/cloudinary";

export default function ImageUploader({ images, onChange, multiple = true }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const { url } = await uploadImageToCloudinary(file);
        uploaded.push(url);
      }
      onChange(multiple ? [...images, ...uploaded] : uploaded);
    } catch (error) {
      toast.error(error.message || "Image upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const moveAt = (index, direction) => {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((url, index) => (
          <div key={url + index} className="relative h-24 w-24 overflow-hidden border border-charcoal-100 dark:border-charcoal-500">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-charcoal-900/70 px-1 py-1">
              <button
                type="button"
                onClick={() => moveAt(index, -1)}
                disabled={index === 0}
                aria-label="Move image earlier"
                className="text-ivory disabled:opacity-30"
              >
                <FaChevronLeft className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label="Remove image"
                className="text-ivory hover:text-burgundy-300"
              >
                <FaTrash className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => moveAt(index, 1)}
                disabled={index === images.length - 1}
                aria-label="Move image later"
                className="text-ivory disabled:opacity-30"
              >
                <FaChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}

        {(multiple || images.length === 0) && (
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-charcoal-200 text-charcoal-400 hover:border-gold-500 hover:text-gold-600 dark:border-charcoal-500 dark:text-ivory-300">
            <FaUpload className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-wider">
              {uploading ? "Uploading..." : "Upload"}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple={multiple}
              onChange={handleFiles}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}
