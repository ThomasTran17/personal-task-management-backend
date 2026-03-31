import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { JsonApiInterceptor } from './interceptors/json-api.interceptor';
import { JsonApiExceptionFilter } from './filters/json-api-exception.filter';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: JsonApiInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: JsonApiExceptionFilter,
    },
  ],
  exports: [],
})
export class CommonModule {}
