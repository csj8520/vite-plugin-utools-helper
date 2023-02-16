# vite-plugin-utools-helper

使用 `Vite` 开发和编译 `utools` 插件

- 支持 preload 编译
- 支持 打包 upx

> 配置相关可参考此插件： [utools-plugin-tinypng](https://github.com/csj8520/utools-plugin-tinypng)

## 如何使用

### 1. 安装 vite-plugin-utools-helper

```sh
npm i vite-plugin-utools-helper -D
```

### 2. 修改 vite.config.ts

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createPreloadPlugin, createUpxPlugin } from 'vite-plugin-utools-helper';
import { createStyleImportPlugin, ElementPlusResolve } from 'vite-plugin-style-import';

export default defineConfig({
  base: './',
  server: {
    port: 3100
  },
  plugins: [
    vue(),
    createStyleImportPlugin({
      resolves: [ElementPlusResolve()]
    }),
    /**
     * preload 已禁用压缩，不建议引用较大第三方库，否则有可能审核不通过
     */
    createPreloadPlugin({
      // name: 'window.preload',       // 修改 preload.ts 导出到全局变量的名称
      // path: 'src/preload/index.ts', // 修改 preload.ts 的路径
    }),
    /**
     * 核心逻辑参考自： https://github.com/13enBi/vite-plugin-utools/blob/main/src/buildUpx.ts
     */
    createUpxPlugin({
      // outDir: 'upx',
      outFileName: 'tinypng-[version].upx'
    })
  ]
});
```

### 3. 修改 ./public/plugin.json

若使用 `createUpxPlugin` 功能，以下字段为必选项，缺少将影响 `utools` 对 `upx` 文件的识别

> `name`, `pluginName`, `description`, `author`, `homepage`, `version`, `logo`, `features`

```json
{
  // 对 plugin.json 增加类型校验和提示
  "$schema": "../node_modules/vite-plugin-utools-helper/dist/schema.json",
  "name": "abcdefg", // uTools 开发者工具中的项目 id
  "pluginName": "插件名称",
  "description": "插件描述",
  "author": "https://github.com/csj8520", // 作者主页地址
  "homepage": "https://github.com/csj8520/utools-plugin-tinypng", // 此插件主页地址
  "version": "0.0.1",

  "logo": "logo.png",
  "main": "index.html", // 固定路径
  "preload": "preload.js", // 固定路径
  "development": {
    "main": "http://localhost:3100", // 端口和 vite.config.ts 保持一致
    "preload": "preload.js" // 固定路径
  },
  "features": [] // ...
}
```

### 4. 修改 ./src/types.d.ts

增加如下声明

```ts
declare interface Window {
  preload?: typeof import('./preload/index');
}
```

### 5. 执行 `npm run start` | `npm run build`

### 6. 修改 utools 开发者工具配置

重新选择 `plugin.json` 路径为 `./dist/plugin.json`

## 添加 utools api 的类型定义

```sh
npm i utools-api-types -D
```

### 修改 tsconfig.json

添加如下内容

```json
{
  "compilerOptions": {
    "types": ["utools-api-types"]
  }
}
```
