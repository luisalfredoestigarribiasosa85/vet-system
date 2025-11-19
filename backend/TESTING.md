# Guía de Testing

## Configuración

### Backend (Jest)

El backend utiliza Jest para testing unitario e integración.

#### Instalación

```bash
cd backend
pnpm install -D jest supertest @types/jest
```

#### Configuración

Ver `jest.config.js` para configuración completa.

### Frontend (Vitest)

El frontend utiliza Vitest con React Testing Library.

#### Instalación

```bash
cd frontend
pnpm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

#### Configuración

Ver `vitest.config.js` para configuración completa.

## Ejecutar Tests

### Backend

```bash
cd backend

# Ejecutar todos los tests
pnpm test

# Modo watch (re-ejecuta al cambiar archivos)
pnpm run test:watch

# Ver cobertura de código
pnpm run test:coverage
```

### Frontend

```bash
cd frontend

# Ejecutar todos los tests
pnpm test

# UI interactiva de Vitest
pnpm run test:ui

# Ver cobertura de código
pnpm run test:coverage
```

## Estructura de Tests

### Backend

```
backend/
├── tests/
│   ├── setup.js                    # Configuración global
│   ├── unit/
│   │   └── models/
│   │       ├── User.test.js        # Tests del modelo User
│   │       └── Pet.test.js         # Tests del modelo Pet
│   └── integration/
│       └── auth.test.js            # Tests de endpoints auth
```

### Frontend

```
frontend/
├── tests/
│   ├── setup.js                    # Configuración global
│   ├── components/
│   │   └── Sidebar.test.jsx        # Tests de Sidebar
│   └── pages/
│       └── Login.test.jsx          # Tests de Login
```

## Escribir Tests

### Tests Unitarios (Backend)

```javascript
const { User } = require('../../models');

describe('User Model', () => {
  it('debe crear un usuario con datos válidos', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      name: 'Test User',
    };

    const user = await User.create(userData);

    expect(user.id).toBeDefined();
    expect(user.username).toBe('testuser');
  });
});
```

### Tests de Integración (Backend)

```javascript
const request = require('supertest');
const app = require('../../server');

describe('POST /api/auth/login', () => {
  it('debe iniciar sesión con credenciales válidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123',
      })
      .expect(200);

    expect(response.body).toHaveProperty('token');
  });
});
```

### Tests de Componentes (Frontend)

```javascript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../../src/components/layout/Sidebar';

describe('Sidebar Component', () => {
  it('debe renderizar el sidebar correctamente', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Sistema Veterinaria/i)).toBeInTheDocument();
  });
});
```

### Tests con Interacción de Usuario (Frontend)

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../../src/pages/auth/Login';

it('debe permitir ingresar credenciales', async () => {
  const user = userEvent.setup();
  render(<Login />);
  
  const usernameInput = screen.getByLabelText(/usuario/i);
  await user.type(usernameInput, 'testuser');
  
  expect(usernameInput).toHaveValue('testuser');
});
```

## Mejores Prácticas

### General

1. **Nombres descriptivos**: Los tests deben explicar qué se está probando
2. **Arrange-Act-Assert**: Organizar tests en tres secciones claras
3. **Un concepto por test**: Cada test debe verificar una sola cosa
4. **Tests independientes**: No deben depender del orden de ejecución

### Backend

1. **Limpiar datos**: Usar `beforeEach` para limpiar la base de datos
2. **Usar factories**: Crear helpers para generar datos de prueba
3. **Mockear servicios externos**: Email, pagos, etc.
4. **Probar casos edge**: No solo el happy path

### Frontend

1. **Probar comportamiento**: No implementación interna
2. **Queries accesibles**: Usar `getByRole`, `getByLabelText`
3. **Esperar async**: Usar `waitFor` para operaciones asíncronas
4. **Mockear contextos**: Proveer valores de prueba para contextos

## Cobertura de Código

### Objetivos

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Ver Reporte

```bash
# Backend
cd backend
pnpm run test:coverage
# Abre: coverage/index.html

# Frontend
cd frontend
pnpm run test:coverage
# Abre: coverage/index.html
```

### Archivos Excluidos

- `node_modules/`
- Archivos de configuración
- Tests mismos
- Archivos de entrada (main.jsx, server.js)

## Debugging Tests

### Backend (Jest)

```bash
# Ejecutar un solo archivo
pnpm test tests/unit/models/User.test.js

# Ejecutar tests que coincidan con patrón
pnpm test -- --testNamePattern="debe crear usuario"

# Modo debug
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Frontend (Vitest)

```bash
# Ejecutar un solo archivo
pnpm test tests/components/Sidebar.test.jsx

# Modo UI (recomendado para debugging)
pnpm run test:ui

# Modo debug
pnpm test -- --inspect-brk
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: cd backend && pnpm install
      - name: Run tests
        run: cd backend && pnpm test
      
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: cd frontend && pnpm install
      - name: Run tests
        run: cd frontend && pnpm test
```

## Troubleshooting

### Error: Cannot find module

```bash
# Limpiar cache y reinstalar
rm -rf node_modules
pnpm install
```

### Tests timeout

```javascript
// Aumentar timeout en jest.config.js o vitest.config.js
testTimeout: 10000, // 10 segundos
```

### Base de datos de prueba

```bash
# Crear base de datos separada para tests
createdb vet_system_test

# Configurar en .env.test
DB_NAME=vet_system_test
```

## Recursos

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testingjavascript.com/)
