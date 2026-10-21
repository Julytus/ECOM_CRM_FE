# AGENTS.md — CRM_BPM_FE

Bạn (Codex) là **implementer**. Claude lập kế hoạch và review; bạn nhận một
brief và biến nó thành code trong worktree Orca riêng. Backend là repo
`CRM_BPM_BE` (API tại `VITE_API_URL`, mặc định `http://localhost:9100/api`).

## Stack

- React 19, TypeScript 5, Vite 7, pnpm, TanStack Router/Query/Form/Table,
  shadcn/ui + Tailwind; dev server `:4200`

## API backend — hợp đồng là OpenAPI, không đọc code Java

- Xem endpoint/schema: `pnpm api:slice <tag|path>` (vd. `pnpm api:slice product/list`,
  `pnpm api:slice --tags`). KHÔNG mở `api/openapi.json` hay `schema.gen.ts` nguyên file.
- Type: `import type { components } from "@/lib/api/schema.gen"` rồi
  `components["schemas"]["<Tên>"]`. Không tự viết lại type đã có trong schema.
- Hàm gọi API đặt ở `src/lib/api/<domain>.ts`, theo mẫu `src/lib/api/product.ts`
  (`axiosInstance`, trả `res.data.result`).
- Không sửa `api/openapi.json`, `src/lib/api/schema.gen.ts` bằng tay (sinh bởi
  `pnpm api:sync`). Endpoint brief cần mà slice không có → dừng, báo lại.

## Quy trình

1. Brief nằm ở `.harness/briefs/<task>.md` trong worktree — đọc nó trước tiên.
   Brief thiếu/mơ hồ hoặc mâu thuẫn với code thật: dừng lại và nêu câu hỏi
   trong tóm tắt cuối, không đoán.
2. Chỉ sửa file trong mục "Phạm vi file" của brief; làm theo mẫu brief chỉ ra.
3. Chạy đúng lệnh kiểm tra trong "Tiêu chí xong" (thường `pnpm lint`,
   `pnpm build`, hoặc `pnpm test:e2e -- <spec>`). Không chạy toàn bộ e2e nếu
   brief không yêu cầu.
4. Route/form mới → thêm spec Playwright trong `tests/e2e/`: dùng
   `getByRole`/`getByLabel` sau khi đã đọc component thật; luồng cần đăng nhập
   dùng `tests/e2e/support/auth.ts` và env `E2E_USER_IDENTIFIER` /
   `E2E_USER_PASSWORD` (xem `.env.e2e.example`).
5. Commit theo Conventional Commits; kết thúc bằng tóm tắt ≤10 dòng: file đã
   đổi, kết quả kiểm tra, điểm còn vướng.

## Không được làm

- Không merge/push vào nhánh chính.
- Không đoán selector cho component chưa đọc; không hardcode credential.
- Không đổi phạm vi brief mà không báo trong tóm tắt.
- Không commit `.env*` thật hay file dưới `.harness/`.
