import nextConfig from "eslint-config-next";

const eslintConfig = [
  { ignores: ["legacy/**", "node_modules/**", ".next/**"] },
  ...nextConfig,
];

export default eslintConfig;
