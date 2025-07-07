import picomatch from "picomatch";

export default function createAutoElFormPreventPlugin(options = {}) {
  const {
    // 包含的文件模式，默认处理所有.vue文件
    include = ["**/*.vue"],
    // 排除的文件模式
    exclude = [],
    // 自定义文件过滤函数
    filter = null,
    // 是否启用插件
    enabled = true,
  } = options;

  return {
    name: "vite-plugin-el-form-submit-prevent",
    enforce: "pre", // 决定执行顺序比预处理先
    transform(code, id) {
      // 如果插件被禁用，直接返回
      if (!enabled) {
        return null;
      }

      // 自定义过滤函数检查
      if (filter && typeof filter === "function") {
        if (!filter(id)) {
          return null;
        }
      } else {
        // 标准化路径为Unix风格
        // 标准化路径为Unix风格
        const normalizedId = id.replace(/\\/g, "/");

        // 检查include模式
        const shouldInclude = include.some((pattern) => {
          const isMatch = picomatch(pattern);
          return isMatch(normalizedId) || isMatch(id.split(/[\/\\]/).pop());
        });

        // 检查exclude模式
        const shouldExclude = exclude.some((pattern) => {
          const isMatch = picomatch(pattern);
          return isMatch(normalizedId) || isMatch(id.split(/[\/\\]/).pop());
        });

        if (!shouldInclude || shouldExclude) {
          return null;
        }
      }

      // 使用正则表达式匹配 el-form 标签
      const elFormRegex = /<el-form(?![a-zA-Z-])([^>]*)>/g;
      let hasChanges = false;
      const transformedCode = code.replace(elFormRegex, (match, attributes) => {
        if (attributes.includes("@submit")) {
          return match;
        }
        hasChanges = true;
        const newAttributes = attributes.trim();
        if (newAttributes) {
          return `<el-form ${newAttributes} @submit.native.prevent>`;
        } else {
          return `<el-form @submit.native.prevent>`;
        }
      });

      if (hasChanges) {
        return {
          code: transformedCode,
          map: null,
        };
      }

      return null;
    },
  };
}
