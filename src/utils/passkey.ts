// ── Passkey (WebAuthn) 浏览器侧工具 ──
// 浏览器 WebAuthn 仪式（navigator.credentials.create / get）与 Moonlark 后端
// passkey 接口的对接。
// 说明：服务端返回的选项 JSON 中 challenge / credential id 等字段是 base64url 字符串，
// 而浏览器 API 要求 ArrayBuffer，这里负责双向转换。

import { apiRequest } from './api';
import { setCookie } from './cookie';
import { clearApiCache } from './cache';
import { setCachedPrefix } from './prefix';
import { invalidateSessionCache } from './user';

// ── 基础编解码 ──

function b64urlToBytes(value: string): Uint8Array {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function bytesToB64url(data: ArrayBuffer | Uint8Array): string {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ── 浏览器支持检测 ──

/**
 * 是否支持 Passkey 登录。
 * 注意：WebAuthn 只在 secure context（HTTPS 或 localhost）下可用。
 */
export function passkeySupported(): boolean {
    if (typeof window === 'undefined' || !window.isSecureContext) return false;
    return typeof window.PublicKeyCredential !== 'undefined';
}

/** 把 WebAuthn 抽象方法（如 platform 认证器支持）限制在可用时使用 */
export function isPlatformAuthenticatorAvailable(): boolean {
    return typeof window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
}

// ── 选项 JSON → 浏览器选项对象 ──

export interface PasskeyCreationOptionsJSON {
    rp: { name: string; id?: string };
    user?: { id: string; name: string; displayName: string };
    challenge: string;
    pubKeyCredParams?: Array<{ type: string; alg: number }>;
    timeout?: number;
    excludeCredentials?: Array<{ type: string; id: string; transports?: string[] }>;
    authenticatorSelection?: {
        authenticatorAttachment?: string;
        residentKey?: string;
        requireResidentKey?: boolean;
        userVerification?: string;
    };
    attestation?: string;
    hints?: string[];
}

export interface PasskeyRequestOptionsJSON {
    challenge: string;
    timeout?: number;
    rpId?: string;
    allowCredentials?: Array<{ type: string; id: string; transports?: string[] }>;
    userVerification?: string;
}

function prepareCreateOptions(options: PasskeyCreationOptionsJSON): PublicKeyCredentialCreationOptions {
    const prepared: Record<string, unknown> = { ...options };
    prepared.challenge = b64urlToBytes(options.challenge);
    if (options.user) {
        prepared.user = { ...options.user, id: b64urlToBytes(options.user.id) };
    }
    if (Array.isArray(options.excludeCredentials)) {
        prepared.excludeCredentials = options.excludeCredentials.map((cred) => ({
            ...cred,
            id: b64urlToBytes(cred.id),
        }));
    }
    return prepared as unknown as PublicKeyCredentialCreationOptions;
}

function prepareRequestOptions(options: PasskeyRequestOptionsJSON): PublicKeyCredentialRequestOptions {
    const prepared: Record<string, unknown> = { ...options };
    prepared.challenge = b64urlToBytes(options.challenge);
    if (Array.isArray(options.allowCredentials)) {
        prepared.allowCredentials = options.allowCredentials.map((cred) => ({
            ...cred,
            id: b64urlToBytes(cred.id),
        }));
    }
    return prepared as unknown as PublicKeyCredentialRequestOptions;
}

/** 把浏览器返回的 PublicKeyCredential 序列化成后端可解析的 JSON（camelCase） */
export function serializeCredential(credential: PublicKeyCredential): Record<string, unknown> {
    const response: Record<string, unknown> = {};
    if (credential.response instanceof AuthenticatorAttestationResponse) {
        response.clientDataJSON = bytesToB64url(credential.response.clientDataJSON);
        response.attestationObject = bytesToB64url(credential.response.attestationObject);
        const transports = credential.response.getTransports();
        if (transports && transports.length > 0) response.transports = transports;
    } else if (credential.response instanceof AuthenticatorAssertionResponse) {
        response.clientDataJSON = bytesToB64url(credential.response.clientDataJSON);
        response.authenticatorData = bytesToB64url(credential.response.authenticatorData);
        response.signature = bytesToB64url(credential.response.signature);
        if (credential.response.userHandle) {
            response.userHandle = bytesToB64url(credential.response.userHandle);
        }
    }
    return {
        id: credential.id,
        rawId: bytesToB64url(credential.rawId),
        response,
        type: credential.type,
        // TS 类型未收录 authenticatorAttachment，浏览器实际会返回
        authenticatorAttachment: (credential as { authenticatorAttachment?: string }).authenticatorAttachment,
    };
}

// ── 与后端交互 ──

export interface PasskeyLoginResult {
    session_id: string;
    user_id: string;
    command_prefix?: string;
}

export interface PasskeyListItem {
    id: string;
    device_name: string;
    created_at: number | null;
    last_used_at: number | null;
}

export function listPasskeys(): Promise<PasskeyListItem[]> {
    return apiRequest<PasskeyListItem[]>('/passkeys');
}

export interface PasskeyMessageResult {
    success: boolean;
    message: string;
}

/**
 * 使用 Passkey 登录：获取挑战 → 浏览器断言 → 后端验证并创建会话。
 * @param userId 可选：传入时后端只允许该用户的凭据；不传则使用可发现凭据
 * @param retentionDays 「记住我」天数
 * @param signal 取消浏览器 WebAuthn 弹窗
 */
export async function loginWithPasskey(
    userId?: string,
    retentionDays?: number,
    signal?: AbortSignal,
): Promise<PasskeyLoginResult> {
    const options = await apiRequest<PasskeyRequestOptionsJSON>('/login/passkey/options', {
        method: 'POST',
        body: userId ? { user_id: userId } : {},
        auth: false,
    });
    const assertion = await navigator.credentials.get({
        publicKey: prepareRequestOptions(options),
        signal,
    });
    if (!(assertion instanceof PublicKeyCredential)) {
        throw new DOMException("未完成 Passkey 验证", "NotAllowedError");
    }
    const data = await apiRequest<PasskeyLoginResult>('/login/passkey/verify', {
        method: 'POST',
        body: {
            ...serializeCredential(assertion),
            retention_days: retentionDays,
        },
        auth: false,
    });
    setCookie('sessionID', data.session_id);
    if (data.command_prefix != null) setCachedPrefix(data.command_prefix);
    invalidateSessionCache();
    clearApiCache();
    return data;
}

/**
 * 为当前登录账号注册一个 Passkey。
 * @param deviceName 显示名称（如「我的 iPhone」）
 * @param signal 取消浏览器 WebAuthn 弹窗
 */
export async function registerPasskey(deviceName: string, signal?: AbortSignal): Promise<void> {
    const options = await apiRequest<PasskeyCreationOptionsJSON>('/passkeys/register/options', {
        method: 'POST',
        auth: true,
    });
    const credential = await navigator.credentials.create({
        publicKey: prepareCreateOptions(options),
        signal,
    });
    if (!(credential instanceof PublicKeyCredential)) {
        throw new DOMException("未完成 Passkey 注册", "NotAllowedError");
    }
    await apiRequest<PasskeyMessageResult>('/passkeys/register/verify', {
        method: 'POST',
        body: {
            ...serializeCredential(credential),
            device_name: deviceName,
        },
        auth: true,
    });
}

export function renamePasskey(credentialId: string, deviceName: string): Promise<PasskeyMessageResult> {
    return apiRequest<PasskeyMessageResult>(`/passkeys/${encodeURIComponent(credentialId)}`, {
        method: 'PATCH',
        body: { device_name: deviceName },
    });
}

export function deletePasskey(credentialId: string): Promise<PasskeyMessageResult> {
    return apiRequest<PasskeyMessageResult>(`/passkeys/${encodeURIComponent(credentialId)}`, {
        method: 'DELETE',
    });
}

/** 把 WebAuthn 失败原因翻译成用户可读文案；返回 null 表示用户主动取消，无需提示 */
export function passkeyErrorText(error: unknown): string | null {
    if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') return null; // 用户取消 / 拒绝授权
        if (error.name === 'NotFoundError') return '未找到可用的 Passkey，请先在「设置」中注册';
        if (error.name === 'NotSupportedError' || error.name === 'SecurityError') {
            return '当前环境不支持 Passkey（需要 HTTPS 与受支持的浏览器）';
        }
        if (error.name === 'InvalidStateError') return '该设备已注册过 Passkey';
        if (error.name === 'AbortError') return null;
        return `Passkey 失败：${error.name}`;
    }
    return 'Passkey 操作失败，请稍后重试';
}
