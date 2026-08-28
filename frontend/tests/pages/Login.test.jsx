import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../src/pages/auth/Login';
import toast from 'react-hot-toast';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock del hook real que consume Login (hooks/useAuth)
const mockLogin = vi.fn();
vi.mock('../../src/hooks/useAuth', () => ({
    useAuth: () => ({
        login: mockLogin,
        user: null,
        loading: false,
    }),
}));

// Mock de react-hot-toast: sin <Toaster> montado no hay DOM que inspeccionar
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const renderLogin = () => {
    return render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );
};

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLogin.mockResolvedValue({ success: true });
    });

    it('debe renderizar el formulario de login', async () => {
        renderLogin();

        expect(await screen.findByLabelText(/usuario/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('debe permitir ingresar username y password', async () => {
        const user = userEvent.setup();
        renderLogin();

        const usernameInput = await screen.findByLabelText(/usuario/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);

        await user.type(usernameInput, 'testuser');
        await user.type(passwordInput, 'password123');

        expect(usernameInput).toHaveValue('testuser');
        expect(passwordInput).toHaveValue('password123');
    });

    it('debe mostrar error si los campos están vacíos', async () => {
        const user = userEvent.setup();
        renderLogin();

        const submitButton = await screen.findByRole('button', { name: /iniciar sesión/i });
        await user.click(submitButton);

        // La validación HTML5 (required) debería prevenir el submit
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('debe llamar a login con credenciales correctas', async () => {
        const user = userEvent.setup();
        renderLogin();

        const usernameInput = await screen.findByLabelText(/usuario/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

        await user.type(usernameInput, 'testuser');
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);

        // El contexto real firma login(username, password)
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
        });
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
        expect(toast.success).toHaveBeenCalledWith('Inicio de sesión exitoso');
    });

    it('debe mostrar mensaje de error en login fallido', async () => {
        const user = userEvent.setup();
        mockLogin.mockResolvedValue({ success: false, message: 'Credenciales inválidas' });

        renderLogin();

        const usernameInput = await screen.findByLabelText(/usuario/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

        await user.type(usernameInput, 'wronguser');
        await user.type(passwordInput, 'wrongpass');
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Credenciales inválidas');
        });
        expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard');
    });
});
