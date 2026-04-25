import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

/**
 * Утилита для обхода CORS ограничений при работе с Firebase Storage.
 * Предлагает локальную обработку файла, если запрос к Firebase Storage блокируется политикой CORS.
 */
export const handleStorageWithCors = {
  /**
   * Загружает файл в Firebase Storage с обработкой CORS ошибок.
   * @param file Файл для загрузки
   * @param uid Идентификатор пользователя
   * @param setProgress Функция обновления прогресса загрузки
   * @returns Promise с URL загруженного файла или объект с локальным URL и содержимым файла
   */
  uploadFile: async (
    file: File, 
    uid: string, 
    setProgress?: (progress: number) => void
  ): Promise<{ url: string, localFile?: boolean, content?: string }> => {
    const storage = getStorage();
    const fileRef = ref(storage, `resumes/${uid}/${file.name}`);
    
    try {
      // Попытка загрузки в Firebase Storage
      const uploadTask = uploadBytesResumable(fileRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (setProgress) {
              setProgress(progress);
            }
          },
          async (error) => {
            console.warn('Firebase Storage upload error:', error);
            
            // Если это CORS ошибка или другая сетевая ошибка
            if (
              error.code === 'storage/unauthorized' || 
              error.code === 'storage/cors-error' ||
              error.message?.includes('CORS') ||
              error.name === 'AbortError'
            ) {
              console.log('Switching to local file processing due to CORS issues');
              
              try {
                // Обработка локально
                const content = await readFileAsText(file);
                const localUrl = URL.createObjectURL(file);
                
                resolve({
                  url: localUrl,
                  localFile: true,
                  content
                });
              } catch (localError) {
                reject(localError);
              }
            } else {
              reject(error);
            }
          },
          async () => {
            try {
              // Загрузка успешна, получаем URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({ url: downloadURL });
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error starting upload:', error);
      
      // Если не удалось инициировать загрузку, обрабатываем локально
      try {
        const content = await readFileAsText(file);
        const localUrl = URL.createObjectURL(file);
        
        return {
          url: localUrl,
          localFile: true,
          content
        };
      } catch (localError) {
        throw localError;
      }
    }
  },
  
  /**
   * Получает URL файла из Firebase Storage с обработкой CORS ошибок.
   * @param path Путь к файлу в Firebase Storage
   * @returns Promise с URL файла
   */
  getFileUrl: async (path: string): Promise<string> => {
    const storage = getStorage();
    const fileRef = ref(storage, path);
    
    try {
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  }
};

/**
 * Читает содержимое файла как текст
 * @param file Файл для чтения
 * @returns Promise с содержимым файла в виде текста
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result.toString());
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

/**
 * Читает содержимое файла как ArrayBuffer
 * @param file Файл для чтения
 * @returns Promise с содержимым файла в виде ArrayBuffer
 */
export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as ArrayBuffer);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
}; 