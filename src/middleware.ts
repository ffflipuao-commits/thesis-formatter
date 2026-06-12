import { NextResponse, type NextRequest } from 'next/server';

// 中间件只做最基本的路径处理，不做认证检查
// 认证检查由各页面组件的 AuthGuard 负责
export async function middleware(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
