# 手术复盘 UI 系统

## 功能概述
- 手术视频上传和播放
- 视频内容智能解析
- AI 辅助问答对话
- 医学文献参考
- PDF 报告导出

## 技术栈
- React 18 + TypeScript
- Ant Design 5.x
- Vite 构建工具
- React Player 视频播放
- html2canvas + jsPDF 导出

## 安装运行
```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入真实 API 配置

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 环境变量说明
- `VITE_LLM_API_BASE`: LLM API 基础地址
- `VITE_LLM_API_KEY`: LLM API 密钥
- `VITE_BACKEND_API_BASE`: 后端 API 地址

## 使用指南
1. 上传手术视频文件
2. 等待系统解析视频内容
3. 上传相关医学文献资料
4. 与 AI 助手进行问答交流
5. 导出完整的复盘报告

## 项目结构
```
src/
├── components/           # React 组件
│   ├── ChatPanel/       # 对话面板组件
│   ├── ErrorBoundary.tsx
│   ├── ParseResultDisplay.tsx
│   ├── ReferencesUploader.tsx
│   ├── ReportExporter.tsx
│   ├── VideoPlayer.tsx
│   └── VideoUploader.tsx
├── context/             # React Context
│   └── GlobalContext.tsx
├── hooks/               # 自定义 Hooks
│   ├── useChat.ts
│   └── useParsePolling.ts
├── services/            # API 服务
│   └── api.ts
├── styles/              # 样式文件
│   └── index.css
├── types/               # TypeScript 类型定义
│   └── index.d.ts
├── config/              # 配置文件
│   └── index.ts
├── App.tsx              # 主应用组件
└── main.tsx             # 应用入口
```

## 开发说明
- 使用 ESLint 和 Prettier 进行代码规范检查
- 遵循 TypeScript 严格模式
- 采用函数式组件和 Hooks
- 使用 Context + useReducer 进行状态管理