export const isDevelopment = process.env.NODE_ENV !== 'production';

//Constants
export const DEFAULT_QR_CODE = 'DEFAULT';
export const DEFAULT_ADDRESS = '0x00000000000000000000000000000';
export const APP_NAME = 'BadgeMeal';

//URL
export const API_BASE_URL = isDevelopment ? '/' : 'http://tostit.i234.me:5005/';
export const A2P_API_PREPARE_URL = 'https://a2a-api.klipwallet.com/v2/a2a/prepare';
