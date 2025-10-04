// import { applyDecorators, Type } from '@nestjs/common';
// import {
//   ApiResponse as SwaggerApiResponse,
//   ApiResponseOptions,
// } from '@nestjs/swagger';
// import { ApiResponse } from '../interceptors/response.interceptor';

// export function ApiResponseDecorator<T>(
//   type: Type<T>,
//   options?: ApiResponseOptions,
// ) {
//   return applyDecorators(
//     SwaggerApiResponse({
//       status: 200,
//       description: 'Success',
//       type: type,
//       ...options,
//     }),
//   );
// }

// export function ApiResponseListDecorator<T>(
//   type: Type<T>,
//   options?: ApiResponseOptions,
// ) {
//   return applyDecorators(
//     SwaggerApiResponse({
//       status: 200,
//       description: 'Success',
//       type: [type],
//       ...options,
//     }),
//   );
// }

// export function ApiErrorResponseDecorator(
//   status: number,
//   description: string,
//   options?: ApiResponseOptions,
// ) {
//   return applyDecorators(
//     SwaggerApiResponse({
//       status,
//       description,
//       ...options,
//     }),
//   );
// }

// export { ApiResponse };
