import type { Api, NativeBridge } from '@/preload/index';

declare global {
    const api: Api;
    const nativeBridge: NativeBridge

    interface Window {
        api: Api;
        nativeBridge: NativeBridge;
    }
}
