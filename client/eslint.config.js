module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended", // 使用 Prettier 插件
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [
    "react",
    "prettier", // 添加 Prettier 插件
  ],
  rules: {
    "prettier/prettier": "error", // 将 Prettier 规则设置为错误级别
  },
  settings: {
    react: {
      version: "detect", // 自动检测 React 版本
    },
  },
};
