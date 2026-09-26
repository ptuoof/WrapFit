# 🗄️ @wrapfit/backend — Backend APIs, Database & Storage

> **Phụ trách chính**: 👤 **IT 3** (Backend, Data Infrastructure & Cloud BaaS Lead)  
> **Tech Stack**: Express.js / TypeScript, PostgreSQL (Prisma ORM), S3 Storage, Auth.

---

## Cấu trúc thư mục `be/`:

```text
be/
├── prisma/
│   └── schema.prisma           # CSDL PostgreSQL (Users, Projects, Templates, Jobs)
├── src/
│   ├── controllers/            # Xử lý logic nghiệp vụ API
│   ├── services/               # StorageService (S3), AI Pattern generator
│   ├── routes/                 # Định tuyến API RESTful
│   └── index.ts                # Server entrypoint
├── package.json
└── tsconfig.json
```

## Chạy thử nghiệm:

```bash
cd be
npm install
npm run db:push     # Cập nhật schema lên PostgreSQL
npm run dev         # Chạy server tại http://localhost:5000
```
