# FluxChat-Web

## API 生成约定

后端使用 Spring Boot 暴露 OpenAPI 文档后，前端通过 Orval 自动生成接口代码。

默认 OpenAPI 地址：

```bash
http://localhost:8081/v3/api-docs
```

生成命令：

```bash
pnpm api:generate
```

如果后端文档地址不同，可以临时指定：

```bash
$env:ORVAL_OPENAPI_URL="http://localhost:8081/v3/api-docs"; pnpm api:generate
```

目录约定：

```text
src/
├── api/
│   ├── generated/  # Orval 自动生成，不手写
│   ├── modules/    # 业务接口封装
│   └── index.ts
├── http/
│   ├── instance.ts
│   ├── interceptors.ts
│   ├── token.ts
│   └── custom-instance.ts
├── stores/
└── utils/
```

开发规则：

- 后端新增或修改接口后，先保证 `/v3/api-docs` 可访问。
- 前端运行 `pnpm api:generate` 更新 `src/api/generated/`。
- 页面和业务代码只调用 `src/api/modules/`，不要直接改 `src/api/generated/`。
