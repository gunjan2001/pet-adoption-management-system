// src/components/DeletePetModal.tsx
import { X, AlertTriangle } from "lucide-react";
import type { Pet } from "@/types";

interface DeletePetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pet: Pet | null;
  isLoading?: boolean;
}

export default function DeletePetModal({
  isOpen,
  onClose,
  onConfirm,
  pet,
  isLoading = false,
}: DeletePetModalProps) {
  if (!isOpen || !pet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="font-bold text-xl text-gray-900">Delete Pet</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Pet Info Card */}
          <div className="bg-amber-50/60 rounded-xl p-4 mb-4">
            <div className="flex gap-3 items-start">
              {/* Pet Image */}
              <div className="w-14 h-14 rounded-xl bg-amber-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {pet.imageUrl ? (
                  <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🐾</span>
                )}
              </div>
              
              {/* Pet Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900">{pet.name}</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {pet.species}
                  {pet.breed && ` · ${pet.breed}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Status: <span className="capitalize font-medium">{pet.status}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="space-y-3">
            <p className="text-gray-700 font-medium">
              Are you sure you want to delete this pet listing?
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>This action cannot be undone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>All associated adoption applications will be affected</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Pet data will be permanently removed from the system</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-200 transition-all disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
