import client from './client';

// Sends a picked file to the backend and returns its public URL.
export const uploadFile = async (asset) => {
  const form = new FormData();
  const name = asset.fileName || asset.uri.split('/').pop() || 'upload.jpg';
  const match = /\.(\w+)$/.exec(name);
  const type = match ? `image/${match[1] === 'jpg' ? 'jpeg' : match[1]}` : 'image/jpeg';

  form.append('file', { uri: asset.uri, name, type });

  const response = await client.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data.url;
};
