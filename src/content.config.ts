import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    date: z.coerce.date(),
    type: z.enum(['live-demo', 'case-study', 'video-walkthrough']),
    tags: z.array(z.string()),
    thumbnail: z.string(),
    liveUrl: z.string().optional(),
    sourceUrl: z.string().optional(),
    featured: z.boolean().default(false),
    flagship: z.boolean().default(false),
    color: z.string().default('#3B82F6'),
    description: z.string(),
    order: z.number().default(0),
  }),
});

export const collections = { projects };
