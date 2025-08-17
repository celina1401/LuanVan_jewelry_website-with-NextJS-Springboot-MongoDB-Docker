"use client"

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/Footer";
import { HeroSlider } from "@/components/ui/hero-slider";
import { BestSellerProducts } from "@/components/ui/best-seller-products";
import { GoldPriceChart } from "@/components/ui/gold-price-chart";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      <Navbar />
      <main className="flex-1">
        <HeroSlider />
        <section className="w-full py-6 md:py-12 lg:py-16 bg-gray-50 dark:bg-black">
          <div className="container px-4 md:px-6">
            <GoldPriceChart />
          </div>
        </section>
        <BestSellerProducts />
        
        {/* <section className="w-full bg-gray-100 dark:bg-gray-900 py-6 md:py-12 lg:py-16">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bộ sưu tập tinh xảo</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Khám phá bộ sưu tập trang sức được tuyển chọn kỹ lưỡng, chế tác với sự đam mê và tinh xảo.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Vẻ đẹp vượt thời gian</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Trải nghiệm sự kết hợp hoàn hảo giữa thủ công truyền thống và thiết kế hiện đại trong từng sản phẩm.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Chất lượng cao cấp</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Mỗi sản phẩm đều được chế tác từ chất liệu cao cấp với sự tỉ mỉ đến từng chi tiết.
                </p>
              </div>
            </div>
          </div>
        </section> */}
      </main>
      
      <Footer />
    </div>
  );
}