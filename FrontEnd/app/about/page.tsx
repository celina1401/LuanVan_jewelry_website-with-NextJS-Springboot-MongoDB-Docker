import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      <Navbar />
      
      <main className="flex-1">
        <section className="w-full py-12 bg-white dark:bg-black">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  🏢 Giới thiệu Doanh nghiệp
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Chúng tôi là một doanh nghiệp tiên phong trong lĩnh vực thương mại điện tử, 
                  cam kết mang đến trải nghiệm mua sắm tuyệt vời cho khách hàng
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">🎯</span>
                      Sứ mệnh
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Cung cấp các sản phẩm chất lượng cao với giá cả hợp lý, 
                      đáp ứng mọi nhu cầu của khách hàng trong thời đại số.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">🌟</span>
                      Tầm nhìn
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Trở thành đối tác tin cậy hàng đầu trong lĩnh vực thương mại điện tử, 
                      góp phần thúc đẩy sự phát triển của nền kinh tế số Việt Nam.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">💎</span>
                      Giá trị cốt lõi
                    </h3>
                    <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                      <li>• Chất lượng sản phẩm hàng đầu</li>
                      <li>• Dịch vụ khách hàng xuất sắc</li>
                      <li>• Sự minh bạch và uy tín</li>
                      <li>• Đổi mới và sáng tạo không ngừng</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">📞</span>
                      Thông tin liên hệ
                    </h3>
                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-3">
                        <span className="text-blue-600">📍</span>
                        <span>22 Đ. Gia Long, Trà Ôn, Vĩnh Long, Vĩnh Long</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-600">📧</span>
                        <span>tcjewelry@gmail.com</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-purple-600">📱</span>
                        <span>0908934902</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-orange-600">🕒</span>
                        <span>Thứ 2 - Thứ 6: 7:30 - 18:00</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">🚀</span>
                      Dịch vụ chính
                    </h3>
                    <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                      <li>• Bán lẻ sản phẩm đa dạng</li>
                      <li>• Hệ thống hạng thành viên</li>
                      <li>• Giao hàng nhanh chóng</li>
                      <li>• Hỗ trợ khách hàng 24/7</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  📍 Vị trí của chúng tôi
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Trụ sở chính tại Vĩnh Long - nơi giao thoa văn hóa và phát triển kinh tế
                </p>
              </div>
              
              <div className="flex justify-center mb-8">
                <iframe 
                  // title="Vị trí của chúng tôi"
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d245.6008283448825!2d105.92031268119305!3d9.96609957926899!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0642b7e87d7a7%3A0x4e818b2751db279e!2zMjIgxJAuIEdpYSBMb25nLCBUcsOgIMOUbiwgVsSpbmggTG9uZywgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2sus!4v1755344087365!5m2!1svi!2sus"
                  width="100%" 
                  height="450" 
                  style={{border: 0}} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}