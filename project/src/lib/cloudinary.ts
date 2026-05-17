import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export interface UploadProgress {
  progress: number;
  uploadedBytes: number;
  totalBytes: number;
  speed: number; // bytes per second
  timeRemaining: number; // seconds
}

/**
 * Upload image to Cloudinary or Firebase Storage (fallback)
 * @param file - The image file to upload
 * @param folder - Optional folder path (default: 'products')
 * @param onProgress - Optional callback for upload progress
 * @returns Promise<string> - The secure URL of the uploaded image
 */
export const uploadImageToCloudinary = async (
  file: File,
  folder: string = "products",
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  const cloudName = "dtuaqlzvx";
  const uploadPreset = "kiroman";

  // Try Cloudinary first if configured
  if (cloudName && uploadPreset) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", folder);

      // Use XMLHttpRequest for progress tracking
      return await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const startTime = Date.now();
        let lastLoaded = 0;
        let lastTime = startTime;

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable && onProgress) {
            const currentTime = Date.now();
            const timeDiff = (currentTime - lastTime) / 1000; // seconds
            const bytesDiff = e.loaded - lastLoaded;

            const speed = timeDiff > 0 ? bytesDiff / timeDiff : 0;
            const timeRemaining = speed > 0 ? (e.total - e.loaded) / speed : 0;

            onProgress({
              progress: (e.loaded / e.total) * 100,
              uploadedBytes: e.loaded,
              totalBytes: e.total,
              speed,
              timeRemaining,
            });

            lastLoaded = e.loaded;
            lastTime = currentTime;
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.error) {
                reject(new Error(data.error.message));
              } else {
                resolve(data.secure_url);
              }
            } catch (error) {
              reject(new Error("Failed to parse response"));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
        );
        xhr.send(formData);
      });
    } catch (error) {
      console.warn(
        "Cloudinary upload failed, falling back to Firebase Storage:",
        error
      );
      // Fall through to Firebase Storage
    }
  }

  // Fallback to Firebase Storage with progress tracking
  try {
    const timestamp = Date.now();
    const fileName = `${folder}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);

    return await new Promise<string>((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);
      const startTime = Date.now();
      let lastLoaded = 0;
      let lastTime = startTime;

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          if (onProgress) {
            const currentTime = Date.now();
            const timeDiff = (currentTime - lastTime) / 1000; // seconds
            const bytesDiff = snapshot.bytesTransferred - lastLoaded;

            const speed = timeDiff > 0 ? bytesDiff / timeDiff : 0;
            const timeRemaining =
              speed > 0
                ? (snapshot.totalBytes - snapshot.bytesTransferred) / speed
                : 0;

            onProgress({
              progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              uploadedBytes: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              speed,
              timeRemaining,
            });

            lastLoaded = snapshot.bytesTransferred;
            lastTime = currentTime;
          }
        },
        (error) => {
          reject(new Error(`Failed to upload image: ${error.message}`));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(
              new Error(
                `Failed to get download URL: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`
              )
            );
          }
        }
      );
    });
  } catch (error) {
    throw new Error(
      `Failed to upload image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
