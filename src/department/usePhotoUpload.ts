// hooks/usePhotoUpload.ts
import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { storage, db } from '../../lib/firebase';
import { useDepartmentAuth } from '../contexts/DepartmentAuthContext';

interface PhotoUploadResult {
  url: string;
  fileName: string;
  uploadedAt: Date;
}

export const usePhotoUpload = () => {
  const { user } = useDepartmentAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadPhotos = async (
    files: File[], 
    issueId: string, 
    type: 'before' | 'after' | 'progress'
  ): Promise<PhotoUploadResult[]> => {
    if (!user) throw new Error('User not authenticated');
    if (!files.length) return [];

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const timestamp = Date.now();
        const fileName = `departments/${user.department.toLowerCase()}/${issueId}/${type}_${timestamp}_${index}_${file.name}`;
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        setUploadProgress(((index + 1) / files.length) * 100);

        return {
          url: downloadURL,
          fileName: file.name,
          uploadedAt: new Date()
        };
      });

      const results = await Promise.all(uploadPromises);

      const issueRef = doc(db, 'reports', issueId);
      const updateData: any = {};

      if (type === 'before') {
        updateData[`beforeAfterImages.before`] = arrayUnion(...results.map(r => r.url));
      } else if (type === 'after') {
        updateData[`beforeAfterImages.after`] = arrayUnion(...results.map(r => r.url));
      } else {
        updateData.progressImages = arrayUnion(...results.map(r => ({
          url: r.url,
          uploadedBy: user.displayName,
          uploadedAt: new Date(),
          type: 'progress'
        })));
      }

      await updateDoc(issueRef, updateData);

      console.log(`✅ Uploaded ${results.length} ${type} photos for issue ${issueId}`);
      return results;

    } catch (error) {
      console.error('❌ Photo upload error:', error);
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadPhotos,
    uploading,
    uploadProgress
  };
};
