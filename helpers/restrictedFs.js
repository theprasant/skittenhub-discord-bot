// restrictedFs.js
import path from 'node:path'; 
import fs from 'node:fs';

export function createRestrictedFs(baseDir) {
  const restrictedFs = {};

  const allowedFsMethods = [
    'access', 'appendFile', 'chmod', 'chown', 'copyFile', 'cp',
    'createReadStream', 'createWriteStream', 'existsSync', 'fdatasync',
    'fstat', 'fsync', 'ftruncate', 'futimes', 'lchmod', 'lchown', 'link',
    'lstat', 'lutimes', 'mkdir', 'mkdtemp', 'open', 'opendir', 'readdir',
    'readFile', 'readlink', 'realpath', 'rename', 'rm', 'rmdir', 'stat',
    'symlink', 'truncate', 'unlink', 'unwatchFile', 'utimes', 'watch',
    'watchFile', 'writeFile', 'writeFileSync', 'readFileSync',
    'readdirSync', 'statSync', 'lstatSync', 'mkdirSync',
  ];

  const resolveAndValidatePath = (filePath) => {
    const resolvedPath = path.resolve(baseDir, filePath);
    // This is crucial for security!
    if (!resolvedPath.startsWith(baseDir)) { 
      throw new Error(`Access denied: Cannot access files outside "${baseDir}"`);
    }
    return resolvedPath;
  };

  for (const methodName of allowedFsMethods) {
    if (typeof fs[methodName] === 'function') {
      restrictedFs[methodName] = function(...args) {
        // Intercept arguments to replace paths with resolved & validated paths
        if (typeof args[0] === 'string') {
          args[0] = resolveAndValidatePath(args[0]);
        }
        return fs[methodName](...args);
      };
    }
  }

  return restrictedFs;
}

// export default createRestrictedFs;