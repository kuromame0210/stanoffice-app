'use client';

import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import './style.css';

interface ImageUploadProps {
  onImageSelect: (file: File, previewUrl: string) => void;
  onImageRemove: () => void;
  currentPreview?: string | null;
  disabled?: boolean;
}

export const ImageUpload = ({ 
  onImageSelect, 
  onImageRemove, 
  currentPreview, 
  disabled = false 
}: ImageUploadProps) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: number;
    compressedSize: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 画像圧縮の設定
  const compressionOptions = {
    maxSizeMB: 1,                // 最大1MB
    maxWidthOrHeight: 1920,      // 最大1920px
    useWebWorker: true,          // WebWorkerを使用してメインスレッドをブロックしない
    quality: 0.8,               // 品質80%
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // ファイルサイズチェック（圧縮前）
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      alert('ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。');
      return;
    }

    // 画像形式チェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('サポートされていない画像形式です。JPEG、PNG、WebP、GIFファイルを選択してください。');
      return;
    }

    setIsCompressing(true);
    const originalSize = file.size;

    try {
      // 画像圧縮を実行
      const compressedFile = await imageCompression(file, compressionOptions);
      const compressedSize = compressedFile.size;

      // 圧縮情報を保存
      setCompressionInfo({
        originalSize,
        compressedSize,
      });

      // プレビューURL作成
      const previewUrl = URL.createObjectURL(compressedFile);
      
      // 親コンポーネントに通知
      onImageSelect(compressedFile, previewUrl);

    } catch (error) {
      console.error('画像圧縮エラー:', error);
      alert('画像の処理中にエラーが発生しました。別のファイルをお試しください。');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setCompressionInfo(null);
    onImageRemove();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="image-upload-container">
      <div className="image-upload-input-area">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          disabled={disabled || isCompressing}
          className="image-upload-input"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="image-upload-label">
          {isCompressing ? (
            <div className="image-upload-loading">
              <div className="spinner"></div>
              <span>画像を圧縮中...</span>
            </div>
          ) : currentPreview ? (
            <span>画像を変更</span>
          ) : (
            <span>画像を選択</span>
          )}
        </label>
      </div>

      <div className="image-upload-info">
        <p className="upload-hint">
          JPEG、PNG、WebP、GIF形式の画像をアップロードできます
        </p>
        <p className="upload-hint">
          大きな画像は自動的に圧縮されます（最大1MB、1920px）
        </p>
      </div>

      {compressionInfo && (
        <div className="compression-info">
          <p className="compression-text">
            📉 {formatFileSize(compressionInfo.originalSize)} → {formatFileSize(compressionInfo.compressedSize)}
            {compressionInfo.compressedSize < compressionInfo.originalSize && (
              <span className="compression-saved">
                （{Math.round((1 - compressionInfo.compressedSize / compressionInfo.originalSize) * 100)}% 削減）
              </span>
            )}
          </p>
        </div>
      )}

      {currentPreview && (
        <div className="image-preview-container">
          <div className="image-preview">
            <img src={currentPreview} alt="アップロード画像プレビュー" />
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={disabled}
              className="image-remove-button"
              aria-label="画像を削除"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};