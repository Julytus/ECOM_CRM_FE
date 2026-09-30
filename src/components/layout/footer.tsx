"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Facebook, Twitter, Instagram, Send, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-100 to-gray-200 pt-12 pb-12 text-gray-700">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">OAKLYN</h3>
            <p className="text-sm leading-relaxed">
              Chúng tôi mang đến những sản phẩm chất lượng cao với dịch vụ tận tâm, giúp bạn tự tin
              và thoải mái trong từng khoảnh khắc.
            </p>
            <div className="flex gap-3 pt-2">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300/20 transition-all hover:scale-110 hover:bg-gray-400 hover:text-white"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Information Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Thông tin</h4>
            <ul className="space-y-2">
              {[
                { label: "Về chúng tôi", href: "/about" },
                { label: "Câu chuyện của chúng tôi", href: "/store-list" },
                { label: "Hướng dẫn size", href: "/product-detail/1" },
                { label: "Liên hệ", href: "/contact" }
              ].map((link) => (
                <li key={link.label}>
                  <a
                    className="inline-block text-sm transition-all hover:translate-x-1 hover:text-gray-900"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Dịch vụ khách hàng</h4>
            <ul className="space-y-2">
              {[
                { label: "Giao hàng", href: "/product-detail/1" },
                { label: "Đổi trả & Hoàn tiền", href: "/product-detail/1" },
                { label: "Chính sách bảo mật", href: "/term-of-use" },
                { label: "Điều khoản & Điều kiện", href: "/term-of-use" }
              ].map((link) => (
                <li key={link.label}>
                  <a
                    className="inline-block text-sm transition-all hover:translate-x-1 hover:text-gray-900"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900">Nhận bản tin</h4>
            <p className="text-sm text-gray-600">
              Đăng ký để nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
            </p>
            <form className="relative">
              <Input
                type="email"
                placeholder="Email của bạn"
                className="w-full rounded-md border border-gray-300 bg-white/10 pr-20 text-gray-900 placeholder:text-gray-500 focus:border-gray-500 focus:ring-gray-500"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute top-1/2 right-1 h-8 -translate-y-1/2 bg-gray-700 text-white hover:bg-gray-800"
              >
                <Send size={14} />
              </Button>
            </form>

            <Separator className="bg-gray-300" />

            <div className="space-y-2">
              <a
                href="tel:+84956787654"
                className="flex items-center gap-3 text-sm text-gray-700 transition-all hover:text-gray-900"
              >
                <Phone size={16} /> +84 9 567 8765 43
              </a>
              <a
                href="mailto:hello@yourname.com"
                className="flex items-center gap-3 text-sm text-gray-700 transition-all hover:text-gray-900"
              >
                <Mail size={16} /> hello@yourname.com
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-300" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-500 md:flex-row">
          <p>© {new Date().getFullYear()} OAKLYN. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/privacy" className="transition-all hover:text-gray-900">
              Privacy Policy
            </a>
            <a href="/terms" className="transition-all hover:text-gray-900">
              Terms of Service
            </a>
            <a href="/cookies" className="transition-all hover:text-gray-900">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
