export namespace Schema {
  export type Platform = 'win32' | 'darwin' | 'linux';
  export type Development = Partial<Omit<Schema, 'development'>>;
  export interface PluginSetting {
    /**
     * 插件应用是否允许多开（默认不允许）。多开方式：分离插件应用后，再次创建
     * @default true
     */
    single?: boolean;
    /**
     * 插件应用高度。可动态修改（参考），该项被设置后，用户则不能再调整高度。最小值为 1 。
     * @minimum 1
     * @examples [200]
     */
    height?: number;
  }

  export interface Feature {
    /** 插件应用提供的某个功能的唯一标示，此为必选项，且插件应用内不可重复 */
    code: string;
    /** 对此功能的说明，将在搜索列表对应位置中显示 */
    explain?: string;
    /** 功能图标, 相对路径。支持 png、jpg、svg 格式，此为可选项 */
    icon?: string;
    /** 功能适配平台 ["win32", "darwin", "linux"]，此为可选项 */
    platform?: Schema.Platform[];
    /** 该功能下可响应的命令集，支持 6 种类型，由 cmds 的类型或 cmds.type 决定 */
    cmds: Schema.Feature.Cmd[];
  }
  export namespace Feature {
    export type Cmd = string | Cmd.Regex | Cmd.Over | Cmd.Img | Cmd.Files | Cmd.Window;
    export namespace Cmd {
      export interface Regex {
        /**  类型标记（必须）*/
        type: 'regex';
        /** 关键字名称（必须） */
        label: string;
        /**
         * 正则表达式字符串
         * 注意: 正则表达式存如果在斜杠 "\" 需要多加一个，"\\"
         */
        match: string;
        /** 最少字符数 (可选) */
        minLength?: number;
        /** 最多字符数 (可选) */
        maxLength?: number;
      }

      export interface Over {
        /** 类型标记（必须） */
        type: 'over';
        /** 关键字名称（必须） */
        label: string;
        /** 排除正则字符串 (任意文本中排除的部分) (可选) */
        exclude?: string;
        /** 最少字符数 (可选) */
        minLength?: number;
        /** 最多字符数 (默认最多为 10000) (可选) */
        maxLength?: number;
      }
      export interface Img {
        /** 类型标记（必须） */
        type: 'img';
        /** 关键字名称（必须） */
        label: string;
      }
      export interface Files {
        /** 类型标记（必须） */
        type: 'files';
        /** 关键字名称（必须） */
        label: string;
        /** 文件类型 - "file"、"directory" (可选) */
        fileType?: 'file' | 'directory';
        /** 名称匹配正则字符串 (可选) */
        match?: string;
        /** 最少文件数 (可选) */
        minLength?: number;
        /** 最多文件数 (可选) */
        maxLength?: number;
      }
      export interface Window {
        /** 类型标记（必须） */
        type: 'window';
        /** 关键字名称（必须） */
        label: string;
        /** 应用窗口匹配规则 */
        match: {
          /** 应用（必须） */
          app: string[];
          /** 窗口标题正则 (可选) */
          title?: string;
          /** 窗口类 (Windows 专有) (可选) */
          class?: string[];
        };
      }
    }
  }
}

export interface Schema {
  /** uTools 开发者工具中的项目 id */
  name?: string;
  /**
   * 版本号
   * @examples ["0.0.1"]
   */
  version?: string;
  /** 插件名称 */
  pluginName?: string;
  /** 插件描述 */
  description?: string;
  /** 作者主页地址 */
  author?: string;
  /** 此插件主页地址 */
  homepage?: string;

  /**
   * 入口文件，当该配置为空时，表示插件应用为模板插件应用。 main 与 preload 至少存在其一
   * @examples ["index.html", "http://127.0.0.1:3100"]
   */
  main?: string;
  /**
   * 这是一个关键文件，你可以在此文件内调用 uTools、 nodejs、 electron 提供的 api。 main 与 preload 至少存在其一
   * @examples ["preload.js"]
   */
  preload?: string;
  /**
   * 此插件应用的图标，此为必选项
   * @examples ["logo.png"]
   */
  logo: string;
  /** 插件应用支持的平台，此为可选项，默认为全平台支持 */
  platform?: Schema.Platform[];
  /** 开发模式配置 */
  development?: Schema.Development;
  /** 插件应用设置 */
  pluginSetting?: Schema.PluginSetting;
  /** features 描述了当 uTools 主输入框内容产生变化时，此插件应用是否显示在搜索结果列表中，一个插件应用可以有多个功能，一个功能可以提供多个命令供用户搜索 */
  features: Schema.Feature[];
}
