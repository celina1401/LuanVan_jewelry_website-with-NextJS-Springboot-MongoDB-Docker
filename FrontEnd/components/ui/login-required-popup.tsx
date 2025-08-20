"use client"

import { Button } from "./button"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"

interface LoginRequiredPopupProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
}

export function LoginRequiredPopup({ 
  isOpen, 
  onClose, 
  title = "Đăng nhập để tiếp tục", 
  message = "Bạn cần đăng nhập để thực hiện thao tác này." 
}: LoginRequiredPopupProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleLogin = () => {
    onClose()
    router.push('/login')
  }

  const handleRegister = () => {
    onClose()
    router.push('/register')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            {message}
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
            >
              Đăng nhập
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chưa có tài khoản?{" "}
                <button
                  onClick={handleRegister}
                  className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}