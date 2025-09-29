# RSA加密替代方案分析

## 问题背景

当前项目中的 `packages/utils/src/rsa.ts` 使用了Node.js的 `crypto` 模块，这在浏览器环境中无法使用。需要寻找浏览器兼容的替代方案。

## 现有替代方案

### 1. Web Crypto API (推荐)

**文件位置**: `packages/utils/src/rsa-web.ts`

**优势**:
- 浏览器原生支持，无需额外依赖
- 性能优秀，由浏览器底层实现
- 安全性高，符合Web标准
- 支持现代加密算法

**特点**:
- 密钥格式：JWK (JSON Web Key)
- 默认算法：RSA-OAEP with SHA-256
- 默认密钥长度：2048位
- 异步API

**使用示例**:
```typescript
import { generateWebRSAKeyPair, webRSAEncrypt, webRSADecrypt } from './rsa-web';

// 生成密钥对
const keyPair = await generateWebRSAKeyPair({
  modulusLength: 2048,
  hashAlgorithm: 'SHA-256'
});

// 加密
const encrypted = await webRSAEncrypt('Hello World', keyPair.publicKey);

// 解密
const decrypted = await webRSADecrypt(encrypted, keyPair.privateKey);
```

### 2. Node-forge (已存在)

**文件位置**: `packages/utils/src/crypto/forge.ts`

**优势**:
- 纯JavaScript实现，跨平台兼容
- 支持PEM格式密钥（与Node.js兼容）
- 功能完整，支持多种加密算法

**特点**:
- 密钥格式：PEM
- 算法：RSA-OAEP
- 默认密钥长度：1024位
- 需要额外依赖

### 3. 现有Web Crypto Manager (已存在)

**文件位置**: `packages/utils/src/crypto/web.ts`

**优势**:
- 基于Web Crypto API
- 统一的接口设计
- 支持长文本加密

## 兼容性测试结果

通过 `packages/utils/test/rsa-compatibility.test.ts` 测试验证：

✅ **Node.js crypto ↔ Forge**: 完全兼容
- Node.js生成的PEM密钥可以被Forge使用
- Forge生成的PEM密钥可以被Node.js使用
- 加密解密结果一致

⚠️ **Web Crypto API**: 需要格式转换
- 使用JWK格式，与PEM格式不直接兼容
- 需要额外的格式转换工具

## 推荐方案

### 对于新项目
推荐使用 **Web Crypto API** (`rsa-web.ts`)，因为：
1. 浏览器原生支持，性能最佳
2. 无需额外依赖
3. 符合现代Web标准
4. 安全性高

### 对于现有项目
推荐使用 **Node-forge** (`crypto/forge.ts`)，因为：
1. 与现有Node.js代码完全兼容
2. 无需修改现有密钥格式
3. 可以无缝替换Node.js crypto

## 迁移指南

### 从Node.js crypto迁移到Web Crypto API

```typescript
// 原代码 (Node.js)
import { generateKeyPairSync, rsaEncrypt, rsaDecrypt } from './rsa';

const keyPair = generateKeyPairSync(2048);
const encrypted = rsaEncrypt('message', keyPair.publicKey);
const decrypted = rsaDecrypt(encrypted, keyPair.privateKey);

// 新代码 (Web Crypto API)
import { generateWebRSAKeyPair, webRSAEncrypt, webRSADecrypt } from './rsa-web';

const keyPair = await generateWebRSAKeyPair({ modulusLength: 2048 });
const encrypted = await webRSAEncrypt('message', keyPair.publicKey);
const decrypted = await webRSADecrypt(encrypted, keyPair.privateKey);
```

### 从Node.js crypto迁移到Forge

```typescript
// 原代码 (Node.js)
import { generateKeyPairSync, rsaEncrypt, rsaDecrypt } from './rsa';

const keyPair = generateKeyPairSync(2048);
const encrypted = rsaEncrypt('message', keyPair.publicKey);
const decrypted = rsaDecrypt(encrypted, keyPair.privateKey);

// 新代码 (Forge) - 完全兼容
import { ForgeCryptoManager } from './crypto/forge';

const forgeManager = new ForgeCryptoManager();
const keyPair = await forgeManager.generateKeyPair();
const encrypted = await forgeManager.encrypt(keyPair.publicKey, 'message');
const decrypted = await forgeManager.decrypt(keyPair.privateKey, encrypted);
```

## 性能对比

| 方案 | 密钥生成 | 加密速度 | 解密速度 | 包大小 | 兼容性 |
|------|----------|----------|----------|--------|--------|
| Node.js crypto | 快 | 快 | 快 | 0KB | Node.js only |
| Web Crypto API | 快 | 快 | 快 | 0KB | 现代浏览器 |
| Node-forge | 中等 | 中等 | 中等 | ~200KB | 全平台 |

## 安全考虑

1. **密钥长度**: 推荐使用2048位或更高
2. **填充模式**: 所有方案都使用OAEP填充，安全性高
3. **哈希算法**: Web Crypto API默认使用SHA-256，Forge也支持
4. **密钥存储**: JWK格式更适合Web应用，PEM格式更适合服务器

## 总结

项目已经具备了完整的RSA加密替代方案：

1. **Web Crypto API** - 现代浏览器的最佳选择
2. **Node-forge** - 与现有代码完全兼容的选择
3. **现有Crypto Manager** - 统一的加密接口

建议根据具体使用场景选择合适的方案，并确保进行充分的兼容性测试。