import { Storage } from '@google-cloud/storage';

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const BUCKET_NAME = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || `${PROJECT_ID}-uploads`;

if (!PROJECT_ID) {
  throw new Error('GOOGLE_CLOUD_PROJECT_ID environment variable is not set');
}

const storage = new Storage({
  projectId: PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export const bucket = storage.bucket(BUCKET_NAME);

// Initialize bucket with CORS configuration
async function initializeBucket() {
  try {
    const [exists] = await bucket.exists();
    if (!exists) {
      await bucket.create();
    }
    
    await bucket.setCorsConfiguration([
      {
        maxAgeSeconds: 3600,
        method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        origin: ['*'], // In production, replace with your actual domains
        responseHeader: ['Content-Type', 'x-goog-meta-*']
      }
    ]);
  } catch (error) {
    console.error('Failed to initialize bucket:', error);
  }
}

// Initialize bucket when the app starts
initializeBucket();

export const getSignedUrl = async (filename: string): Promise<string> => {
  try {
    const file = bucket.file(filename);
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error('File not found');
    }

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });
    return url;
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    throw error;
  }
}; 