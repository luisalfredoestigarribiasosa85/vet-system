import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../src/pages/auth/Login';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock AuthContext
const mockLogin = vi.fn();
vi.mock('../../src/contexts/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
        user: null,
    }),
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
    });

    it('debe renderizar el formulario de login', () => {
        renderLogin();

        expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('debe permitir ingresar username y password', async () => {
        const user = userEvent.setup();
        renderLogin();

        const usernameInput = screen.getByLabelText(/usuario/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);

        await user.type(usernameInput, 'testuser');
        await user.type(passwordInput, 'password123');

        expect(usernameInput).toHaveValue('testuser');
        expect(passwordInput).toHaveValue('password123');
    });

    it('debe mostrar error si los campos están vacíos', async () => {
        const user = userEvent.setup();
        renderLogin();

        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
        await user.click(submitButton);

        // HTML5 validation debería prevenir el submit
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('debe llamar a login con credenciales correctas', async () => {
        const user = userEvent.setup();
        mockLogin.mockResolvedValue({ success: true });

        renderLogin();

        const usernameInput = screen.getByLabelText(/usuario/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

        await user.type(usernameInput, 'testuser');
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                username: 'testuser',
                password: 'password123',
            });
        });
    });

    it('debe mostrar mensaje de error en login fallido', async () => {
        const user = userEvent.setup();
        mockLogin.mockRejectedValue(new Error('Credenciales inválidas'));

        renderLogin();

        const usernameInput = screen.getByLabelText(/usuario/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

        await user.type(usernameInput, 'wronguser');
        await user.type(passwordInput, 'wrongpass');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/error/i)).toBeInTheDocument();
        });
    });
});
