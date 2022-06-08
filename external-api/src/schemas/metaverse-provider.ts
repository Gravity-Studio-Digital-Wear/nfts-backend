import { Schema, model } from 'mongoose';

interface IMetaverseProvider {
    name: string;
    secret: string;
}

const metaverseSchema = new Schema<IMetaverseProvider>({
    name: { type: String, required: true },
    secret: { type: String, required: true },
});

export const MetaverseProvider = model<IMetaverseProvider>('MetaverseProvider', metaverseSchema);

