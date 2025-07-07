import { describe, it, expect } from "vitest";
import createAutoElFormPreventPlugin from "../index.js";

describe("性能测试", () => {
  it("应该能够快速处理大型文件", () => {
    const plugin = createAutoElFormPreventPlugin();

    // 生成一个包含多个el-form的大型文件
    const largeForms = Array.from(
      { length: 100 },
      (_, i) => `<el-form :model="form${i}">form content ${i}</el-form>`
    ).join("\n");

    const largeCode = `
<template>
  <div>
    ${largeForms}
  </div>
</template>
    `;

    const startTime = performance.now();
    const result = plugin.transform(largeCode, "large.vue");
    const endTime = performance.now();

    expect(result).not.toBeNull();
    expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成

    // 验证所有表单都被正确处理
    const matches = result.code.match(/@submit\.native\.prevent/g);
    expect(matches).toHaveLength(100);
  });

  it("应该能够快速跳过不相关的文件", () => {
    const plugin = createAutoElFormPreventPlugin();

    const irrelevantCode = `
<template>
  <div>
    ${"<div>content</div>".repeat(1000)}
  </div>
</template>
    `;

    const startTime = performance.now();
    const result = plugin.transform(irrelevantCode, "irrelevant.vue");
    const endTime = performance.now();

    expect(result).toBeNull();
    expect(endTime - startTime).toBeLessThan(10); // 应该很快返回null
  });
});
