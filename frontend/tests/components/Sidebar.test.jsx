import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../../src/components/layout/Sidebar';

// Mock AuthContext
const mockAuthContext = {
    user: {
        name: 'Test User',
        role: 'admin',
    },
    logout: vi.fn(),
};

vi.mock('../../src/contexts/AuthContext', () => ({
    useAuth: () => mockAuthContext,
}));

const renderSidebar = () => {
    return render(
        <BrowserRouter>
            <Sidebar />
        </BrowserRouter>
    );
};

describe('Sidebar Component', () => {
    it('debe renderizar el sidebar correctamente', () => {
        renderSidebar();

        // Verificar que el título esté presente
        expect(screen.getByText(/Sistema Veterinaria/i)).toBeInTheDocument();
    });

    it('debe mostrar el nombre del usuario', () => {
        renderSidebar();

        expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('debe mostrar enlaces de navegación principales', () => {
        renderSidebar();

        // Verificar enlaces principales
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Clientes')).toBeInTheDocument();
        expect(screen.getByText('Mascotas')).toBeInTheDocument();
        expect(screen.getByText('Citas')).toBeInTheDocument();
    });

    it('debe mostrar enlaces de administración para admin', () => {
        renderSidebar();

        // Admin debe ver inventario y facturación
        expect(screen.getByText('Inventario')).toBeInTheDocument();
        expect(screen.getByText('Facturación')).toBeInTheDocument();
    });

    it('debe tener enlaces con href correctos', () => {
        renderSidebar();

        const dashboardLink = screen.getByText('Dashboard').closest('a');
        expect(dashboardLink).toHaveAttribute('href', '/dashboard');

        const clientsLink = screen.getByText('Clientes').closest('a');
        expect(clientsLink).toHaveAttribute('href', '/clients');
    });
});
