import { describe, it, expect, beforeEach } from "vitest";
import createAutoElFormPreventPlugin from "../index.js";

describe("createAutoElFormPreventPlugin", () => {
  describe("基础功能测试", () => {
    it("应该返回一个有效的Vite插件对象", () => {
      const plugin = createAutoElFormPreventPlugin();
      expect(plugin).toHaveProperty(
        "name",
        "vite-plugin-el-form-submit-prevent"
      );
      expect(plugin).toHaveProperty("enforce", "pre");
      expect(plugin).toHaveProperty("transform");
      expect(typeof plugin.transform).toBe("function");
    });

    it("应该正确处理默认配置", () => {
      const plugin = createAutoElFormPreventPlugin();
      const mockCode = `
        <template>
          <el-form :model="form">
            <el-form-item label="用户名">
              <el-input v-model="form.username"></el-input>
            </el-form-item>
          </el-form>
        </template>
      `;

      const result = plugin.transform(mockCode, "test.vue");

      expect(result).not.toBeNull();
      expect(result.code).toContain("@submit.native.prevent");
    });
  });

  describe("代码转换测试", () => {
    let plugin;

    beforeEach(() => {
      plugin = createAutoElFormPreventPlugin();
    });

    it("应该为没有@submit属性的el-form添加@submit.native.prevent", () => {
      const code = '<el-form :model="form">content</el-form>';
      const result = plugin.transform(code, "test.vue");

      expect(result.code).toBe(
        '<el-form :model="form" @submit.native.prevent>content</el-form>'
      );
    });

    it("应该为空属性的el-form添加@submit.native.prevent", () => {
      const code = "<el-form>content</el-form>";
      const result = plugin.transform(code, "test.vue");

      expect(result.code).toBe(
        "<el-form @submit.native.prevent>content</el-form>"
      );
    });

    it("应该跳过已经有@submit属性的el-form", () => {
      const code =
        '<el-form :model="form" @submit="handleSubmit">content</el-form>';
      const result = plugin.transform(code, "test.vue");

      expect(result).toBeNull();
    });

    it("应该跳过已经有@submit.prevent属性的el-form", () => {
      const code =
        '<el-form :model="form" @submit.prevent="handleSubmit">content</el-form>';
      const result = plugin.transform(code, "test.vue");

      expect(result).toBeNull();
    });

    it("应该处理多个el-form标签", () => {
      const code = `
          <el-form :model="form1">form1</el-form>
          <el-form :model="form2" @submit="existing">form2</el-form>
          <el-form>form3</el-form>
        `;
      const result = plugin.transform(code, "test.vue");

      expect(result.code).toContain(
        '<el-form :model="form1" @submit.native.prevent>'
      );
      expect(result.code).toContain(
        '<el-form :model="form2" @submit="existing">'
      );
      expect(result.code).toContain(
        "<el-form @submit.native.prevent>form3</el-form>"
      );
    });

    it("应该跳过非.vue文件", () => {
      const code = '<el-form :model="form">content</el-form>';
      const result = plugin.transform(code, "test.js");

      expect(result).toBeNull();
    });

    it("应该跳过不包含el-form的文件", () => {
      const code = "<div>no el-form here</div>";
      const result = plugin.transform(code, "test.vue");

      expect(result).toBeNull();
    });

    it("应该正确处理el-form-item等相似标签", () => {
      const code = `
          <el-form :model="form">content</el-form>
          <el-form-item label="test">item</el-form-item>
        `;
      const result = plugin.transform(code, "test.vue");

      expect(result.code).toContain(
        '<el-form :model="form" @submit.native.prevent>'
      );
      expect(result.code).toContain(
        '<el-form-item label="test">item</el-form-item>'
      );
    });
  });

  describe("配置选项测试", () => {
    it("应该支持enabled配置", () => {
      const plugin = createAutoElFormPreventPlugin({ enabled: false });
      const code = '<el-form :model="form">content</el-form>';
      const result = plugin.transform(code, "test.vue");

      expect(result).toBeNull();
    });

    it("应该支持include配置", () => {
      const plugin = createAutoElFormPreventPlugin({
        include: ["src/**/*.vue"],
      });

      const code = '<el-form :model="form">content</el-form>';

      // 应该处理匹配的文件
      let result = plugin.transform(code, "src/components/test.vue");
      expect(result).not.toBeNull();

      // 应该跳过不匹配的文件
      result = plugin.transform(code, "other/test.vue");
      expect(result).toBeNull();
    });

    it("应该支持exclude配置", () => {
      const plugin = createAutoElFormPreventPlugin({
        exclude: ["**/test/**/*.vue"],
      });

      const code = '<el-form :model="form">content</el-form>';

      // 应该处理不在排除列表的文件
      let result = plugin.transform(code, "src/components/form.vue");
      expect(result).not.toBeNull();

      // 应该跳过在排除列表的文件
      result = plugin.transform(code, "src/test/form.vue");
      expect(result).toBeNull();
    });

    it("应该支持filter函数配置", () => {
      const plugin = createAutoElFormPreventPlugin({
        filter: (id) => id.includes("components"),
      });

      const code = '<el-form :model="form">content</el-form>';

      // 应该处理filter返回true的文件
      let result = plugin.transform(code, "src/components/form.vue");
      expect(result).not.toBeNull();

      // 应该跳过filter返回false的文件
      result = plugin.transform(code, "src/pages/form.vue");
      expect(result).toBeNull();
    });
  });

  describe("边界情况测试", () => {
    let plugin;

    beforeEach(() => {
      plugin = createAutoElFormPreventPlugin();
    });

    it("应该处理复杂的el-form属性", () => {
      const code = `<el-form
          :model="form"
          :rules="rules"
          ref="formRef"
          label-width="120px"
          @validate="onValidate"
        >content</el-form>`;

      const result = plugin.transform(code, "test.vue");

      expect(result.code).toContain("@submit.native.prevent");
      expect(result.code).toContain(':model="form"');
      expect(result.code).toContain('@validate="onValidate"');
    });

    it("应该处理包含换行的el-form标签", () => {
      const code = `<el-form
          :model="form"
          :rules="rules"
        >
          content
        </el-form>`;

      const result = plugin.transform(code, "test.vue");

      expect(result.code).toContain("@submit.native.prevent");
    });
  });
});
