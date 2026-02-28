import { NextResponse, type NextRequest } from 'next/server'

// Credenciales de acceso para Agentes C2
const USERNAME = 'clawy'
const PASSWORD = 'AgentesC2_2026!'

export function middleware(request: NextRequest) {
  // Verificar autenticación básica
  const authCookie = request.cookies.get('agentes_c2_auth')
  
  if (authCookie?.value === 'authenticated') {
    return NextResponse.next()
  }

  // Verificar header de autenticación básica
  const authHeader = request.headers.get('authorization')
  
  if (authHeader) {
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')
    const user = auth[0]
    const pass = auth[1]
    
    if (user === USERNAME && pass === PASSWORD) {
      // Autenticación exitosa - establecer cookie
      const response = NextResponse.next()
      response.cookies.set('agentes_c2_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 1 semana
      })
      return response
    }
  }

  // No autenticado - mostrar login
  const url = request.nextUrl.clone()
  
  // Si es una ruta de API o assets, retornar 401
  if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/api')) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Para rutas normales, mostrar página de login
  return new NextResponse(
    `<!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Agentes C2 - Acceso</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
        }
        .container {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(100, 116, 139, 0.3);
          border-radius: 24px;
          padding: 48px;
          width: 100%;
          max-width: 420px;
          text-align: center;
        }
        .emoji { font-size: 64px; margin-bottom: 24px; }
        h1 { color: white; font-size: 28px; margin-bottom: 8px; }
        p { color: #94a3b8; margin-bottom: 32px; }
        form { display: flex; flex-direction: column; gap: 16px; }
        input {
          width: 100%;
          padding: 16px;
          border: 1px solid rgba(100, 116, 139, 0.3);
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.6);
          color: white;
          font-size: 16px;
          outline: none;
          transition: border-color 0.2s;
        }
        input:focus { border-color: #fb923c; }
        input::placeholder { color: #64748b; }
        button {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(251, 146, 60, 0.3);
        }
        .error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 16px;
          display: none;
        }
        .footer {
          margin-top: 32px;
          color: #64748b;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">🐾</div>
        <h1>Agentes C2</h1>
        <p>Command Center - Acceso restringido</p>
        <div class="error" id="error">❌ Credenciales incorrectas</div>
        <form id="loginForm">
          <input type="text" id="username" name="username" placeholder="Usuario" required autocomplete="username">
          <input type="password" id="password" name="password" placeholder="Contraseña" required autocomplete="current-password">
          <button type="submit">🔓 Acceder</button>
        </form>
        <div class="footer">
          🔒 Mission Control de Clawy
        </div>
      </div>
      <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          const credentials = btoa(username + ':' + password);
          
          try {
            const response = await fetch(window.location.href, {
              headers: { 'Authorization': 'Basic ' + credentials }
            });
            
            if (response.ok) {
              document.cookie = 'agentes_c2_auth=authenticated; path=/; max-age=' + (60 * 60 * 24 * 7);
              window.location.reload();
            } else {
              document.getElementById('error').style.display = 'block';
            }
          } catch (err) {
            document.getElementById('error').style.display = 'block';
          }
        });
      </script>
    </body>
    </html>`,
    {
      status: 401,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'WWW-Authenticate': 'Basic realm="Agentes C2"'
      }
    }
  )
}

export const config = {
  matcher: [
    /*
     * Proteger todas las rutas excepto:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
