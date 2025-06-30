"use client"

import { Navbar } from "@/components/navbar";
import { HeroSlider } from "@/components/ui/hero-slider";
import { BestSellerProducts } from "@/components/ui/best-seller-products";
import { GoldPriceChart } from "@/components/ui/gold-price-chart";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSlider />
        <section className="w-full py-6 md:py-12 lg:py-16 bg-background">
          <div className="container px-4 md:px-6">
            <GoldPriceChart />
          </div>
        </section>
        <BestSellerProducts />
        
        <section className="w-full bg-muted py-6 md:py-12 lg:py-16">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Bộ sưu tập tinh xảo</h3>
                <p className="text-muted-foreground">
                  Khám phá bộ sưu tập trang sức được tuyển chọn kỹ lưỡng, chế tác với sự đam mê và tinh xảo.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Vẻ đẹp vượt thời gian</h3>
                <p className="text-muted-foreground">
                  Trải nghiệm sự kết hợp hoàn hảo giữa thủ công truyền thống và thiết kế hiện đại trong từng sản phẩm.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Chất lượng cao cấp</h3>
                <p className="text-muted-foreground">
                  Mỗi sản phẩm đều được chế tác từ chất liệu cao cấp với sự tỉ mỉ đến từng chi tiết.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} T&C Jewelry. Đã đăng ký bản quyền.
          </p>
        </div>
      </footer>
    </div>
  );
}