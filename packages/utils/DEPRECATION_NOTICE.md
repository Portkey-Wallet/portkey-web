# 🚨 RSA Module Deprecation Notice

## Important Changes

**Functions in `packages/utils/src/rsa.ts` have been deprecated!**

The following functions will no longer work and will throw errors when called:

- ❌ `rsaEncrypt()`
- ❌ `rsaDecrypt()`  
- ❌ `generateKeyPairSync()`

## Why Deprecate?

The original `rsa.ts` file used Node.js's `crypto` module, which cannot be used in browser environments. To provide cross-platform compatibility, we have provided better alternatives.

## 🔄 Migration Guide

### Option 1: Web Crypto API (Recommended for browsers)

```typescript
// ❌ Old code
import { rsaEncrypt, rsaDecrypt, generateKeyPairSync } from './rsa';

const keyPair = generateKeyPairSync(2048);
const encrypted = rsaEncrypt('message', keyPair.publicKey);
const decrypted = rsaDecrypt(encrypted, keyPair.privateKey);

// ✅ New code
import { generateWebRSAKeyPair, webRSAEncrypt, webRSADecrypt } from './rsa-web';

const keyPair = await generateWebRSAKeyPair({ modulusLength: 2048 });
const encrypted = await webRSAEncrypt('message', keyPair.publicKey);
const decrypted = await webRSADecrypt(encrypted, keyPair.privateKey);
```

### Option 2: Node-forge (Recommended for Node.js compatibility)

```typescript
// ❌ Old code
import { rsaEncrypt, rsaDecrypt, generateKeyPairSync } from './rsa';

const keyPair = generateKeyPairSync(2048);
const encrypted = rsaEncrypt('message', keyPair.publicKey);
const decrypted = rsaDecrypt(encrypted, keyPair.privateKey);

// ✅ New code
import { ForgeCryptoManager } from './crypto/forge';

const forgeManager = new ForgeCryptoManager();
const keyPair = await forgeManager.generateKeyPair();
const encrypted = await forgeManager.encrypt(keyPair.publicKey, 'message');
const decrypted = await forgeManager.decrypt(keyPair.privateKey, encrypted);
```

## 📋 Usage in Project

After comprehensive search, the following files were found to call the deprecated functions:

### Test Files (Need Updates)
- `packages/utils/test/rsa.test.ts` - Original test file
- `packages/utils/test/rsa-compatibility.test.ts` - Compatibility test file

### Example Files (Need Updates)
- `packages/utils/src/rsa-example.ts` - Usage example file

### Export Files (Remain Unchanged)
- `packages/utils/src/index.ts` - Still exports rsa module, but functions will throw errors

### ✅ Production Code
**Good news: No production code was found directly calling these functions!**

## 🛠️ Error Message Example

When calling deprecated functions, you will see an error like this:

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

## 📚 More Information

- Detailed alternatives analysis: `RSA_ALTERNATIVES.md`
- Usage examples: `src/rsa-example.ts`
- Web Crypto API implementation: `src/rsa-web.ts`
- Node-forge implementation: `src/crypto/forge.ts`

## ⏰ Timeline

- **Now**: Function calls will throw errors with alternative suggestions
- **Future versions**: These functions will be completely removed

## 🤝 Need Help?

If you encounter issues during migration, please:

1. Check `RSA_ALTERNATIVES.md` for detailed guidance
2. Refer to example code in `src/rsa-example.ts`
3. Run test files to verify your implementation

---

**Remember: This change is to provide better cross-platform compatibility!** 🎉