import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../../api/axiosInstance';
import {
  IMAGE_ENDPOINT,
  PLACEHOLDER_ROOM_IMAGE,
  getRoleFromStorage,
} from '../../constants/roomConstants';
import useRoomMutations from '../../hooks/useRoomMutations';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function RoomImageUpload({ roomId, onUploadSuccess, onDeleteSuccess }) {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(PLACEHOLDER_ROOM_IMAGE);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localError, setLocalError] = useState('');
  const isAdmin = getRoleFromStorage() === 'ADMIN';
  const { uploadImage, deleteImage, loading } = useRoomMutations();

  const refreshImage = useCallback(async () => {
    if (!roomId) return;

    try {
      const response = await axiosInstance.get(IMAGE_ENDPOINT(roomId), { responseType: 'blob' });
      setPreviewUrl(URL.createObjectURL(response.data));
    } catch {
      setPreviewUrl(PLACEHOLDER_ROOM_IMAGE);
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    let objectUrl = null;
    axiosInstance
      .get(IMAGE_ENDPOINT(roomId), { responseType: 'blob' })
      .then((response) => {
        objectUrl = URL.createObjectURL(response.data);
        setPreviewUrl(objectUrl);
      })
      .catch(() => {
        setPreviewUrl(PLACEHOLDER_ROOM_IMAGE);
      });

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [roomId]);

  const validateFile = (file) => {
    if (!file) return 'Please select an image.';
    if (!file.type.startsWith('image/')) return 'Only image files are allowed.';
    if (file.size > MAX_FILE_SIZE) return 'Image must be 5MB or smaller.';
    return '';
  };

  const handleSelect = (file) => {
    const message = validateFile(file);
    if (message) {
      setLocalError(message);
      setSelectedFile(null);
      return;
    }

    setLocalError('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!roomId || !selectedFile) return;
    await uploadImage(roomId, selectedFile, {
      onUploadProgress: (event) => {
        if (!event.total) return;
        setUploadProgress(Math.round((event.loaded * 100) / event.total));
      },
    });
    setUploadProgress(0);
    setSelectedFile(null);
    await refreshImage();
    onUploadSuccess?.();
  };

  const handleDelete = async () => {
    if (!roomId) return;
    const confirmed = window.confirm('Remove this room image?');
    if (!confirmed) return;

    await deleteImage(roomId);
    setSelectedFile(null);
    setPreviewUrl(PLACEHOLDER_ROOM_IMAGE);
    onDeleteSuccess?.();
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Room Image</h3>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-slate-50">
        <img src={previewUrl} alt="Room preview" className="h-48 w-full object-cover" />
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const droppedFile = e.dataTransfer.files?.[0];
          if (droppedFile) handleSelect(droppedFile);
        }}
        className="rounded-xl border border-dashed border-gray-300 p-4 text-center"
      >
        <p className="text-sm text-gray-600">Drag and drop image here or select a file</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Choose Image
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleSelect(e.target.files?.[0])}
        />
      </div>

      {selectedFile && (
        <p className="text-sm text-gray-700">Selected: {selectedFile.name}</p>
      )}
      {localError && <p className="text-sm text-red-600">{localError}</p>}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || loading || uploadProgress > 0}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload Image'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          Delete Image
        </button>
      </div>
    </section>
  );
}

RoomImageUpload.propTypes = {
  roomId: PropTypes.number.isRequired,
  onUploadSuccess: PropTypes.func,
  onDeleteSuccess: PropTypes.func,
};

RoomImageUpload.defaultProps = {
  onUploadSuccess: undefined,
  onDeleteSuccess: undefined,
};
