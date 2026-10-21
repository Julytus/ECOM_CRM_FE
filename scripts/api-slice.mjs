// In gọn phần API cần dùng từ api/openapi.json, kèm mọi schema liên quan (đã resolve $ref),
// để AI đọc ~1-2k token thay vì cả spec.
// Dùng: pnpm api:slice <lọc...>   lọc = chuỗi con của path, hoặc tên tag (không phân biệt hoa thường)
//       pnpm api:slice --tags      liệt kê tag và số endpoint
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const spec = JSON.parse(await readFile(resolve(root, "api/openapi.json"), "utf8"));
const METHODS = ["get", "post", "put", "patch", "delete"];
// Git Bash (MSYS) đổi "/product" thành "C:/Program Files/Git/product" — gỡ lại tiền tố đó.
const args = process.argv.slice(2).map((a) => a.replace(/^[A-Za-z]:[\\/].*?[\\/]Git(?=[\\/])/, ""));

const operations = Object.entries(spec.paths ?? {}).flatMap(([path, item]) =>
  METHODS.filter((m) => item[m]).map((m) => ({ path, method: m, op: item[m], shared: item.parameters ?? [] }))
);

if (args.length === 0 || args[0] === "--tags") {
  const counts = {};
  for (const { op } of operations) for (const t of op.tags ?? ["(untagged)"]) counts[t] = (counts[t] ?? 0) + 1;
  console.log("tags (pnpm api:slice <tag|path>):");
  for (const [t, n] of Object.entries(counts).sort()) console.log(`  ${t}  ${n}`);
  process.exit(0);
}

const needles = args.map((a) => a.toLowerCase());
const picked = operations.filter(({ path, op }) =>
  needles.some((n) => path.toLowerCase().includes(n) || (op.tags ?? []).some((t) => t.toLowerCase() === n))
);
if (picked.length === 0) {
  console.error(`api:slice: không có endpoint nào khớp ${args.join(", ")} — thử "pnpm api:slice --tags"`);
  process.exit(1);
}

const refName = (ref) => ref.split("/").pop();
const used = new Set();

const typeOf = (s) => {
  if (!s) return "unknown";
  if (s.$ref) {
    used.add(refName(s.$ref));
    return refName(s.$ref);
  }
  const nul = s.nullable ? " | null" : "";
  if (s.allOf) return s.allOf.map(typeOf).join(" & ") + nul;
  if (s.oneOf || s.anyOf) return (s.oneOf ?? s.anyOf).map(typeOf).join(" | ") + nul;
  if (s.enum) return s.enum.map((v) => JSON.stringify(v)).join(" | ") + nul;
  if (s.type === "array") return `${typeOf(s.items)}[]` + nul;
  if (s.type === "object" || s.properties) {
    if (!s.properties) return (s.additionalProperties ? `Record<string, ${typeOf(s.additionalProperties)}>` : "object") + nul;
    return inlineObject(s) + nul;
  }
  const base = s.type === "integer" ? "number" : (s.type ?? "unknown");
  return (s.format && s.format !== "int32" && s.format !== "int64" ? `${base}<${s.format}>` : base) + nul;
};

const inlineObject = (s) => {
  const req = new Set(s.required ?? []);
  const fields = Object.entries(s.properties ?? {}).map(([k, v]) => `${k}${req.has(k) ? "" : "?"}: ${typeOf(v)}`);
  return `{ ${fields.join("; ")} }`;
};

const bodySchema = (op) => {
  const content = op.requestBody?.content ?? {};
  const [mime, media] = Object.entries(content)[0] ?? [];
  return mime ? `${typeOf(media.schema)}${mime === "application/json" ? "" : `  (${mime})`}` : null;
};

const out = [];
for (const { path, method, op, shared } of picked) {
  out.push(`${method.toUpperCase()} ${path}${op.tags ? `  [${op.tags.join(", ")}]` : ""}${op.summary ? `  — ${op.summary}` : ""}`);
  const params = [...shared, ...(op.parameters ?? [])];
  for (const where of ["path", "query", "header"]) {
    const ps = params.filter((p) => p.in === where);
    if (ps.length) out.push(`  ${where}: ${ps.map((p) => `${p.name}${p.required ? "" : "?"}: ${typeOf(p.schema)}`).join(", ")}`);
  }
  const body = bodySchema(op);
  if (body) out.push(`  body: ${body}`);
  for (const [code, r] of Object.entries(op.responses ?? {})) {
    const media = Object.values(r.content ?? {})[0];
    out.push(`  ${code}: ${media ? typeOf(media.schema) : (r.description ?? "")}`);
  }
}

// resolve schema theo từng lớp cho tới khi không còn $ref mới
const printed = new Set();
const schemaLines = [];
for (let pending = [...used]; pending.length; pending = [...used].filter((n) => !printed.has(n))) {
  for (const name of pending) {
    printed.add(name);
    const s = spec.components?.schemas?.[name];
    schemaLines.push(`  ${name} = ${s ? typeOf({ ...s, $ref: undefined }) : "(không có trong spec)"}`);
  }
}

console.log(out.join("\n"));
if (schemaLines.length) {
  console.log('\nschemas  (type TS: import type { components } from "@/lib/api/schema.gen"; components["schemas"]["<Tên>"])');
  console.log(schemaLines.sort().join("\n"));
}
