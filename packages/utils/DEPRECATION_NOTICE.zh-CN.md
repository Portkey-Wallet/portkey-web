# 🚨 RSA模块弃用通知

## 重要变更

**`packages/utils/src/rsa.ts` 中的函数已被弃用！**

以下函数将不再工作，调用时会抛出错误：

- ❌ `rsaEncrypt()`
- ❌ `rsaDecrypt()`  
- ❌ `generateKeyPairSync()`

## 为什么弃用？

原始的 `rsa.ts` 文件使用了Node.js的 `crypto` 模块，这在浏览器环境中无法使用。为了提供跨平台兼容性，我们提供了更好的替代方案。

## 🔄 迁移指南

### 方案1：Web Crypto API (推荐用于浏览器)

```typescript
// ❌ 旧代码
import { rsaEncrypt, rsaDecrypt, generateKeyPairSync } from './rsa';

const keyPair = generateKeyPairSync(2048);
const encrypted = rsaEncrypt('message', keyPair.publicKey);
const decrypted = rsaDecrypt(encrypted, keyPair.privateKey);

// ✅ 新代码
import { generateWebRSAKeyPair, webRSAEncrypt, webRSADecrypt } from './rsa-web';

const keyPair = await generateWebRSAKeyPair({ modulusLength: 2048 });
const encrypted = await webRSAEncrypt('message', keyPair.publicKey);
const decrypted = await webRSADecrypt(encrypted, keyPair.privateKey);
```

### 方案2：Node-forge (推荐用于Node.js兼容性)

```typescript
// ❌ 旧代码
import { rsaEncrypt, rsaDecrypt, generateKeyPairSync } from './rsa';

const keyPair = generateKeyPairSync(2048);
const encrypted = rsaEncrypt('message', keyPair.publicKey);
const decrypted = rsaDecrypt(encrypted, keyPair.privateKey);

// ✅ 新代码
import { ForgeCryptoManager } from './crypto/forge';

const forgeManager = new ForgeCryptoManager();
const keyPair = await forgeManager.generateKeyPair();
const encrypted = await forgeManager.encrypt(keyPair.publicKey, 'message');
const decrypted = await forgeManager.decrypt(keyPair.privateKey, encrypted);
```

## 📋 项目中的调用情况

经过全面搜索，发现以下文件调用了已弃用的函数：

### 测试文件 (需要更新)
- `packages/utils/test/rsa.test.ts` - 原始测试文件
- `packages/utils/test/rsa-compatibility.test.ts` - 兼容性测试文件

### 示例文件 (需要更新)
- `packages/utils/src/rsa-example.ts` - 使用示例文件

### 导出文件 (保持不变)
- `packages/utils/src/index.ts` - 仍然导出rsa模块，但函数会抛出错误

### ✅ 生产代码
**好消息：没有发现任何生产代码直接调用这些函数！**

## 🛠️ 错误信息示例

当调用已弃用的函数时，你会看到这样的错误：

```
🚨 DEPRECATED: rsaEncrypt() is no longer supported!

Please use one of these alternatives:

🌐 For Browser Environment:
  import { webRSAEncrypt } from './rsa-web';
  const encrypted = await webRSAEncrypt(message, publicKey);

🔧 For Node.js with Better Compatibility:
  import { ForgeCryptoManager } from './crypto/forge';
  const forgeManager = new ForgeCryptoManager();
  const encrypted = await forgeManager.encrypt(publicKey, message);

📚 See RSA_ALTERNATIVES.md for complete migration guide.
```

## 📚 更多信息

- 详细的替代方案分析：`RSA_ALTERNATIVES.md`
- 使用示例：`src/rsa-example.ts`
- Web Crypto API实现：`src/rsa-web.ts`
- Node-forge实现：`src/crypto/forge.ts`

## ⏰ 时间线

- **现在**: 函数调用会抛出错误，提示使用替代方案
- **未来版本**: 这些函数将被完全移除

## 🤝 需要帮助？

如果你在迁移过程中遇到问题，请：

1. 查看 `RSA_ALTERNATIVES.md` 获取详细指导
2. 参考 `src/rsa-example.ts` 中的示例代码
3. 运行测试文件验证你的实现

---

**记住：这个变更是为了提供更好的跨平台兼容性！** 🎉