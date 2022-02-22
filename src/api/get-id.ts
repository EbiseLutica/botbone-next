import { Post } from './models/post';

export const getId = (post: {id: string} | string) => typeof post === 'string' ? post : post.id;
