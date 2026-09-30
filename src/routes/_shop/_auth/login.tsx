import { LoginForm } from "@/components/form/block/login-form";
import { PageWrapper } from "@/components/layout/page-warper";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_shop/_auth/login")({
  component: LoginPage
});

function LoginPage() {
  return (
    <PageWrapper
      title="Đăng nhập"
      image="/page-title/page-title-5.jpg"
      breadcrumbItems={[{ label: "Trang chủ", href: "/" }, { label: "Tài khoản" }]}
    >
      <div className="container flex justify-center px-8 py-16">
        <LoginForm />
      </div>
    </PageWrapper>
  );
}
