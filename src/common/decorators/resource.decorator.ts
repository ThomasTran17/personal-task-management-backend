import { SetMetadata } from '@nestjs/common';

export const RESOURCE_TYPE_KEY = 'resource_type';

export const Resource = (type: string) => SetMetadata(RESOURCE_TYPE_KEY, type);
