import PocketBase from 'pocketbase';

const pb = new PocketBase('https://api.mindset-it.online');

export default pb;

export const getFileUrl = (collectionId: string, recordId: string, fileName: string) => {
  return `https://api.mindset-it.online/api/files/${collectionId}/${recordId}/${fileName}`;
};
