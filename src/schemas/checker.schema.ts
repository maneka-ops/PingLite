
import {z} from 'zod';

export const checkerSchema = z.object({
   url: z.string()
   .min(1,'URL is required Pakayo')
   .max(2048, 'URL ekak dnna kwwe ntuw walak newei')

});

export type CheckerInput = z.infer<typeof checkerSchema>