import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received request body:', JSON.stringify(body, null, 2));
    const { emailAddress, password, firstName, lastName, publicMetadata } = body;

    // Check environment variables first
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    
    console.log('Environment check:');
    console.log('- CLERK_SECRET_KEY exists:', !!clerkSecretKey);
    console.log('- CLERK_SECRET_KEY length:', clerkSecretKey?.length || 0);
    console.log('- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY exists:', !!publishableKey);
    
    if (!clerkSecretKey) {
      return NextResponse.json(
        { message: 'Clerk secret key không được cấu hình. Vui lòng kiểm tra file .env.local' },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!emailAddress || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'Email, password, firstName, và lastName là bắt buộc' },
        { status: 400 }
      );
    }

    // Validate email format
    const email = Array.isArray(emailAddress) ? emailAddress[0] : emailAddress;
    console.log('Email being validated:', email);
    
    // Basic email validation - just check if it contains @
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Email không hợp lệ. Vui lòng nhập email đúng định dạng (ví dụ: user@example.com)' },
        { status: 400 }
      );
    }

    // Create valid username from email (remove @ and . characters)
    const username = email.replace(/[@.]/g, '_');
    console.log('Generated username:', username);

    // Validate password requirements
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Mật khẩu phải có ít nhất 8 ký tự' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!emailAddress || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'Email, password, firstName, và lastName là bắt buộc' },
        { status: 400 }
      );
    }

    // Prepare data for Clerk API
    const clerkData = {
      email_address: Array.isArray(emailAddress) ? emailAddress : [emailAddress],
      username: username, // Use sanitized username
      password,
      first_name: firstName,
      last_name: lastName,
      public_metadata: publicMetadata || {},
      skip_password_checks: true, // Temporarily skip password breach checks for development
      skip_password_requirement: false
    };

    // Debug logging
    console.log('Clerk API Request Data:', JSON.stringify(clerkData, null, 2));
    console.log('Clerk Secret Key exists:', !!clerkSecretKey);
    console.log('Clerk Secret Key length:', clerkSecretKey?.length || 0);

    // Call Clerk API to create user
    const clerkResponse = await fetch('https://api.clerk.dev/v1/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
        'Clerk-Frontend-API': process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''
      },
      body: JSON.stringify(clerkData)
    });

    if (!clerkResponse.ok) {
      const errorData = await clerkResponse.json();
      console.error('Clerk API Error Status:', clerkResponse.status);
      console.error('Clerk API Error Data:', JSON.stringify(errorData, null, 2));
      
      // Handle specific Clerk error codes
      const errorCode = errorData.errors?.[0]?.code;
      let errorMessage = 'Không thể tạo tài khoản Clerk';
      
                           switch (errorCode) {
          case 'form_identifier_exists':
            errorMessage = 'Email đã tồn tại trong hệ thống Clerk';
            break;
          case 'form_password_policy_violation':
            errorMessage = 'Mật khẩu không đáp ứng yêu cầu bảo mật (cần ít nhất 8 ký tự, chữ hoa, chữ thường và số)';
            break;
          case 'form_identifier_invalid':
            errorMessage = 'Email không hợp lệ';
            break;
          case 'form_password_pwned':
            errorMessage = 'Mật khẩu đã bị lộ trong các vụ rò rỉ dữ liệu. Vui lòng chọn mật khẩu khác để bảo mật tài khoản.';
            break;
          case 'form_data_missing':
            errorMessage = 'Thiếu dữ liệu bắt buộc. Vui lòng kiểm tra lại thông tin.';
            break;
          default:
            errorMessage = errorData.errors?.[0]?.message || 'Lỗi không xác định';
        }
      
      return NextResponse.json(
        { 
          message: errorMessage,
          details: errorData.errors?.[0]?.message || 'Lỗi không xác định'
        },
        { status: clerkResponse.status }
      );
    }

    const clerkUser = await clerkResponse.json();
    
    return NextResponse.json({
      id: clerkUser.id,
      email: clerkUser.email_addresses?.[0]?.email_address,
      firstName: clerkUser.first_name,
      lastName: clerkUser.last_name,
      createdAt: clerkUser.created_at,
      publicMetadata: clerkUser.public_metadata
    });

  } catch (error) {
    console.error('Error creating Clerk user:', error);
    return NextResponse.json(
      { message: 'Lỗi hệ thống khi tạo tài khoản' },
      { status: 500 }
    );
  }
} 