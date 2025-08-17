import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      <Navbar />
      
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900 dark:text-white">
                  Liên hệ với chúng tôi
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 dark:text-gray-300 md:text-xl">
                  Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Form */}
                <Card className="p-6">
                  <CardHeader>
                    <CardTitle>Gửi tin nhắn</CardTitle>
                    <CardDescription>
                      Điền thông tin bên dưới để gửi tin nhắn cho chúng tôi
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Họ và tên</label>
                        <Input placeholder="Nhập họ và tên" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input type="email" placeholder="Nhập email" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Số điện thoại</label>
                      <Input placeholder="Nhập số điện thoại" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tiêu đề</label>
                      <Input placeholder="Nhập tiêu đề tin nhắn" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Nội dung</label>
                      <Textarea 
                        placeholder="Nhập nội dung tin nhắn của bạn..."
                        className="min-h-[120px]"
                      />
                    </div>
                    <Button className="w-full">Gửi tin nhắn</Button>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <div className="space-y-6">
                  <Card className="p-6">
                    <CardHeader>
                      <CardTitle>Thông tin liên hệ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-rose-500" />
                        <div>
                          <p className="font-medium">Địa chỉ</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            123 Đường ABC, Quận XYZ, Hà Nội
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-rose-500" />
                        <div>
                          <p className="font-medium">Điện thoại</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            +84 123 456 789
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-rose-500" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            info@tcjewelry.com
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-rose-500" />
                        <div>
                          <p className="font-medium">Giờ làm việc</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Thứ 2 - Thứ 7: 8:00 - 18:00<br />
                            Chủ nhật: 9:00 - 16:00
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="p-6">
                    <CardHeader>
                      <CardTitle>Hỗ trợ khách hàng</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Đội ngũ hỗ trợ khách hàng của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7.
                      </p>
                      <Button variant="outline" className="w-full">
                        Chat với chúng tôi
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
