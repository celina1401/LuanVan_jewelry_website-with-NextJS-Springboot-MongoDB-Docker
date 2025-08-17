"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Clock, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 text-gray-800 dark:text-white border-t border-gray-200 dark:border-zinc-700">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-zinc-900 font-bold text-sm">T&C</span>
              </div>
              <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-400">T&C Jewelry</h3>
            </div>
            <p className="text-gray-600 dark:text-zinc-300 text-sm leading-relaxed">
              Chuyên cung cấp các sản phẩm trang sức cao cấp, thiết kế độc đáo và chất lượng hàng đầu. 
              Chúng tôi cam kết mang đến vẻ đẹp hoàn hảo cho mọi khách hàng.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="w-10 h-10 bg-gray-300 hover:bg-yellow-500 dark:bg-zinc-700 dark:hover:bg-yellow-500 rounded-full flex items-center justify-center transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-gray-300 hover:bg-yellow-500 dark:bg-zinc-700 dark:hover:bg-yellow-500 rounded-full flex items-center justify-center transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-gray-300 hover:bg-yellow-500 dark:bg-zinc-700 dark:hover:bg-yellow-500 rounded-full flex items-center justify-center transition-colors duration-300">
                <Twitter className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-yellow-600 dark:text-zinc-300 dark:hover:text-yellow-400 transition-colors duration-300 text-sm">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-600 hover:text-yellow-600 dark:text-zinc-300 dark:hover:text-yellow-400 transition-colors duration-300 text-sm">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-yellow-600 dark:text-zinc-300 dark:hover:text-yellow-400 transition-colors duration-300 text-sm">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-yellow-600 dark:text-zinc-300 dark:hover:text-yellow-400 transition-colors duration-300 text-sm">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-yellow-600 dark:text-zinc-300 dark:hover:text-yellow-400 transition-colors duration-300 text-sm">
                  Trang cá nhân
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">Danh mục sản phẩm</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=rings" className="text-gray-600 hover:text-yellow-600 dark:text-zinc-300 dark:hover:text-yellow-400 transition-colors duration-300 text-sm">
                  Nhẫn
                </Link>
              </li>
              <li>
                <Link href="/products?category=necklaces" className="text-gray-600 hover:text-yellow-600 dark:text-zinc-300 dark:hover:text-yellow-400 transition-colors duration-300 text-sm">
                  Dây chuyền
                </Link>
              </li>
              <li>
                <Link href="/products?category=earrings" className="text-gray-600 hover:text-yellow-600 dark:text-zinc-300 dark:hover:text-yellow-400 transition-colors duration-300 text-sm">
                  Bông tai
                </Link>
              </li>
              <li>
                <Link href="/products?category=bracelets" className="text-gray-600 hover:text-yellow-600 dark:text-zinc-300 dark:hover:text-yellow-400 transition-colors duration-300 text-sm">
                  Vòng tay
                </Link>
              </li>
              
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">Thông tin liên hệ</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 dark:text-zinc-300 text-sm">22 Đ. Gia Long, Trà Ôn</p>
                  <p className="text-gray-600 dark:text-zinc-300 text-sm">Vĩnh Long, Việt Nam</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <p className="text-gray-600 dark:text-zinc-300 text-sm">0908934902</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <p className="text-gray-600 dark:text-zinc-300 text-sm">tcjewelry@gmail.com</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 dark:text-zinc-300 text-sm">T2 - CN: 7:30 - 18:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Bottom Footer */}
      {/* <div className="border-t border-gray-200 dark:border-zinc-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-zinc-400 text-sm">
              <span>© {currentYear} T&C Jewelry. Tất cả quyền được bảo lưu.</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-500 hover:text-yellow-600 dark:text-zinc-400 dark:hover:text-yellow-400 transition-colors duration-300">
                Chính sách bảo mật
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-yellow-600 dark:text-zinc-400 dark:hover:text-yellow-400 transition-colors duration-300">
                Điều khoản sử dụng
              </Link>
              <Link href="/shipping" className="text-gray-500 hover:text-yellow-600 dark:text-zinc-400 dark:hover:text-yellow-400 transition-colors duration-300">
                Chính sách vận chuyển
              </Link>
            </div>
            
          </div>
        </div>
      </div> */}
    </footer>
  );
}
