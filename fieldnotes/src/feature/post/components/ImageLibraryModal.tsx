import { useEffect, useState } from "react";
import { api } from "@/shared/api";
import { Modal, Alert } from "@/shared/components";
import type { ImageListItem } from "@/shared/api/types"; // 실제 위치에 맞게 조정

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function ImageLibraryModal({ onSelect, onClose }: Props) {
  const [images, setImages] = useState<ImageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.listImages()
      .then((res) => setImages(res?.result?.images ?? []))
      .catch((e) => setErr((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Modal title="이미지 라이브러리" onClose={onClose} width="640px">
      {err && <Alert msg={err} onClose={() => setErr(null)} />}
      {loading ? (
        <div style={{ padding: "24px", textAlign: "center", color: "#999" }}>불러오는 중...</div>
      ) : images.length === 0 ? (
        <div style={{ padding: "24px", textAlign: "center", color: "#999" }}>업로드된 이미지가 없습니다.</div>
      ) : (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: "8px", maxHeight: "480px", overflowY: "auto",
        }}>
          {images.map((img) => (
            <button
              key={img.filename}
              type="button"
              title={img.filename}
              onClick={() => onSelect(img.url)}
              style={{
                border: "1px solid #ddd", borderRadius: 4, padding: 0, cursor: "pointer",
                overflow: "hidden", aspectRatio: "1", background: "#f5f5f5",
              }}
            >
              <img src={img.url} alt={img.filename} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}